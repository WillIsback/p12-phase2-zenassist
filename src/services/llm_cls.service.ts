import { APICallError, generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { mistral } from '@ai-sdk/mistral';
import { ALLOWED_TAGS } from '@/constants/tags';
import { SYSTEM_PROMPT } from '@/constants/prompts';

const isLocalInference = process.env.INFERENCE_MODE?.toUpperCase() === 'LOCAL';
const LLM_TIMEOUT_MS = 12_000;
const LLM_RATE_LIMIT_RETRIES = 1;
const LLM_RATE_LIMIT_BACKOFF_MS = 1_500;

const localModel = isLocalInference
  ? createOpenAICompatible({
      name: 'vllm',
      apiKey: process.env.PROVIDER_API_KEY,
      baseURL: process.env.LLM_BASE_URL ?? 'http://localhost:8000/v1',
    })('Intel/Qwen3.5-122B-A10B-int4-AutoRound')
  : null;

const premiumModel = mistral('mistral-small-latest');

function getModel() {
  return isLocalInference && localModel ? localModel : premiumModel;
}

function getProviderOptions() {
  if (!isLocalInference) {
    return undefined;
  }

  return {
    vllm: {
      chat_template_kwargs: { enable_thinking: false },
      guided_choice: [...ALLOWED_TAGS],
    },
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryAfterMs(responseHeaders: APICallError['responseHeaders']): number | null {
  if (!responseHeaders) {
    return null;
  }

  const rawRetryAfter = responseHeaders instanceof Headers
    ? responseHeaders.get('retry-after')
    : responseHeaders['retry-after'] ?? responseHeaders['Retry-After'];

  if (!rawRetryAfter) {
    return null;
  }

  const retryAfterSeconds = Number(rawRetryAfter);
  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(0, retryAfterSeconds * 1000);
  }

  const retryAfterDate = Date.parse(rawRetryAfter);
  if (!Number.isNaN(retryAfterDate)) {
    return Math.max(0, retryAfterDate - Date.now());
  }

  return null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function normalizeLabelOutput(rawLabel: string): string {
  const firstNonEmptyLine = rawLabel
    .trim()
    .split(/\r?\n/)
    .find(line => line.trim().length > 0) ?? '';

  return firstNonEmptyLine
    .replace(/^label\s*[:=-]\s*/i, '')
    .replace(/^[\-•*]\s*/, '')
    .replace(/^['"`]+|['"`]+$/g, '')
    .trim();
}

export function mapLabel(rawLabel: string): typeof ALLOWED_TAGS[number] | null {
  const trimmed = normalizeLabelOutput(rawLabel);

  // 1. Exact match
  const exact = ALLOWED_TAGS.find(tag => tag === trimmed);
  if (exact) return exact;

  // 2. Case-insensitive match
  const lower = trimmed.toLowerCase();
  const caseMatch = ALLOWED_TAGS.find(tag => tag.toLowerCase() === lower);
  if (caseMatch) return caseMatch;

  return null;
}

export async function classifyComplaint(complaintText: string): Promise<typeof ALLOWED_TAGS[number] | null> {
  console.log('[classifyComplaint] calling LLM with prompt length:', complaintText.length);
  console.log('[classifyComplaint] inference mode:', isLocalInference ? 'LOCAL' : 'PREMIUM');
  console.log('[classifyComplaint] LLM_BASE_URL:', process.env.LLM_BASE_URL);
  for (let attempt = 0; attempt <= LLM_RATE_LIMIT_RETRIES; attempt += 1) {
    try {
      const { text, request, response } = await generateText({
        model: getModel(),
        system: SYSTEM_PROMPT,
        prompt: complaintText,
        temperature: 0,
        maxOutputTokens: 30,
        providerOptions: getProviderOptions(),
        abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
      });

      // Debug: check the payload and the raw provider response.
      console.log('[classifyComplaint] request body:', request.body);
      console.log('[classifyComplaint] LLM raw response:', text);
      console.log('[classifyComplaint] response body:', JSON.stringify(response.body).slice(0, 500));

      const tag = mapLabel(text);
      if (!tag) {
        console.warn(`[mapLabel] Could not map LLM response "${text}" to any allowed tag`);
      }
      return tag;
    } catch (error) {
      if (isAbortError(error)) {
        console.error('[classifyComplaint] LLM request timed out after', LLM_TIMEOUT_MS, 'ms');
        return null;
      }

      if (error instanceof APICallError) {
        const apiCallError = error as APICallError;

        if (apiCallError.statusCode === 429 && attempt < LLM_RATE_LIMIT_RETRIES) {
          const retryAfterMs = getRetryAfterMs(apiCallError.responseHeaders) ?? LLM_RATE_LIMIT_BACKOFF_MS;
          console.warn('[classifyComplaint] LLM rate limited, retrying after', retryAfterMs, 'ms', {
            statusCode: apiCallError.statusCode,
            isRetryable: apiCallError.isRetryable,
            responseBody: apiCallError.responseBody,
          });
          await sleep(retryAfterMs);
          continue;
        }

        console.error('[classifyComplaint] LLM HTTP error:', {
          statusCode: apiCallError.statusCode,
          isRetryable: apiCallError.isRetryable,
          responseBody: apiCallError.responseBody,
        });
        return null;
      }

      console.error('[classifyComplaint] Unexpected LLM error:', error);
      throw error;
    }
  }

  return null;
}
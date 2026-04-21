import { APICallError, generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { mistral } from '@ai-sdk/mistral';
import { ALLOWED_TAGS } from '@/constants/tags';
import { SYSTEM_PROMPT } from '@/constants/prompts';

const isLocalInference = process.env.INFERENCE_MODE?.toUpperCase() === 'LOCAL';

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
  try {
    const { text, request, response } = await generateText({
      model: getModel(),
      system: SYSTEM_PROMPT,
      prompt: complaintText,
      temperature: 0,
      maxOutputTokens: 30,
      providerOptions: getProviderOptions(),
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
    if (error instanceof APICallError) {
      const apiCallError = error as APICallError;
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
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { mistral } from '@ai-sdk/mistral';
import { ALLOWED_TAGS } from '@/constants/tags';
import { SYSTEM_PROMPT } from '@/constants/prompts';

const isLocal = process.env.INFERENCE_MODE === 'LOCAL'

const provider = createOpenAICompatible({
  name: 'providerName',
  apiKey: process.env.PROVIDER_API_KEY,
  baseURL: process.env.LLM_BASE_URL || 'https://api.provider.com/v1',
});

export function mapLabel(rawLabel: string): typeof ALLOWED_TAGS[number] | null {
  const trimmed = rawLabel.trim();

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
  console.log('[classifyComplaint] LLM_BASE_URL:', process.env.LLM_BASE_URL);
  const { text, request, response } = await generateText({
    model: isLocal ? provider('Intel/Qwen3.5-122B-A10B-int4-AutoRound'): mistral('mistral-small-latest'),
    system: SYSTEM_PROMPT,
    prompt: complaintText,
    temperature: 0.7,
    maxOutputTokens: 30,
    providerOptions: {
      providerName: {
        chat_template_kwargs: { enable_thinking: false },
        guided_choice: [...ALLOWED_TAGS],
      },
    },
  });

  // Debug: check what was actually sent to vLLM
  console.log('[classifyComplaint] request body:', request.body);
  console.log('[classifyComplaint] LLM raw response:', text);
  console.log('[classifyComplaint] response body:', JSON.stringify(response.body).slice(0, 500));

  const tag = mapLabel(text);
  if (!tag) {
    console.warn(`[mapLabel] Could not map LLM response "${text}" to any allowed tag`);
  }
  return tag;
}
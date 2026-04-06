'use server'
import { classifyComplaint } from "@/services/llm_cls.service"
import { setClaimTag } from "@/database/queries"

let lastCallTime = 0;
const MIN_INTERVAL_MS = 1000;

export async function llmAutoTag(claimId: number, complaint: string) {
  const now = Date.now();
  if (now - lastCallTime < MIN_INTERVAL_MS) {
    console.log('[llmAutoTag] rate limited');
    return null;
  }
  lastCallTime = now;

  console.log('[llmAutoTag] called with claimId:', claimId, 'complaint length:', complaint.length);
  const tag = await classifyComplaint(complaint)
  console.log('[llmAutoTag] classifyComplaint returned:', tag);
  if (!tag) return null;
  await setClaimTag(claimId, tag);
  console.log('[llmAutoTag] tag saved to DB');
  return tag;
}
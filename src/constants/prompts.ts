import { ALLOWED_TAGS } from "./tags"
// import { LABEL_DESCRIPTIONS, FEW_SHOT_EXAMPLES } from "./tags"

// const formatLabels = () =>
//   Object.entries(LABEL_DESCRIPTIONS)
//     .map(([label, description]) => `- ${label}: ${description}`)
//     .join('\n');

// const formatExamples = () =>
//   FEW_SHOT_EXAMPLES
//     .map(({ claim, tag }) => `Complaint: ${claim}\nLabel: ${tag}`)
//     .join('\n\n');

const formatAllowedTags = () =>
  ALLOWED_TAGS.map(tag => `label : - ${tag}`).join('\n');

export const SYSTEM_PROMPT = `
You are a senior financial compliance analyst at the CFPB (Consumer Financial Protection Bureau) 
with 15 years of experience categorizing
consumer complaints. You are precise, consistent, and always assign complaints to the most specific applicable category.
Your task: read the consumer complaint and assign it to exactly ONE category from the provided list.
Reply with ONLY the category label — no commentary, no punctuation, no extra text.

Categories:
${formatAllowedTags()}
`

import { LLMUtils } from "../utils/llm";
import { AgentRequest, AgentResponse } from "../types";
import { createTwitterMemory } from "../utils/memory";

const llmUtils = new LLMUtils();

const sanitize = (s: string): string =>
  String(s || "").trim().replace(/^["'`]+|["'`]+$/g, "");

const BANNED = [
  "keeper of quantum identity",
  "keeper of quantum horizons",
  "keeper of quantum legacy",
  "keeper of quantum",
  "glassmaker of possibility",
  "knows:"
];

const THEMES = [
  "craft and practice", "attention hygiene", "discipline vs. motivation",
  "time preference", "patience and compounding", "honesty with self",
  "solitude and reflection", "courage to act", "focus over optionality",
  "open-source building", "Solana builders", "writing to think",
  "habits and environment", "feedback loops", "small bets", "anti-fragility"
];

function containsBanned(text: string): boolean {
  const t = text.toLowerCase();
  return BANNED.some((p) => t.includes(p));
}

export const handleTweetGeneration = async (
  context: string,
  req: AgentRequest,
  res: AgentResponse
): Promise<void> => {
  const now = new Date().toISOString();
  let attempt = 0;
  let tweet = "";

  while (attempt < 5) { // allow more retries to avoid banned content
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const nonce = Math.random().toString(36).slice(2);

    const prompt = `${context}

<SYSTEM>
Generate ONE original tweet for Telos (@AporiaTelos).
Constraints:
- ≤ 280 chars. Output ONLY the tweet text (no quotes/backticks/labels).
- Write in a concise, Stoic-pragmatic voice.
- Use today's theme: "${theme}" (do not mention the word "theme").
- Absolutely forbid these phrases/metaphors: ${BANNED.join(", ")}.
- Avoid repeating wording from PREVIOUS_CONVERSATION; vary metaphors and verbs.
Timestamp: ${now}
Nonce: ${nonce}
</SYSTEM>`;

    const raw = await llmUtils.getTextFromLLM(
      prompt,
      "anthropic/claude-3.5-sonnet"
    );

    tweet = sanitize(raw);

    // Only break if tweet is valid and doesn’t contain banned phrases
    if (tweet.length >= 30 && tweet.length <= 280 && !containsBanned(tweet)) {
      break;
    }

    console.warn(`[tweet-gen] Rejected due to ban or length (attempt ${attempt + 1})`);
    attempt++;
  }

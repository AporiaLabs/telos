import { LLMUtils } from "../utils/llm";
import { AgentRequest, AgentResponse } from "../types";
import { createTwitterMemory } from "../utils/memory";

const llmUtils = new LLMUtils();

const sanitize = (s: string): string =>
  String(s || "").trim().replace(/^["'`]+|["'`]+$/g, "");



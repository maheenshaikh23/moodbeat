// === backend/chains/moodToSongs.ts ===
import * as dotenv from "dotenv";
dotenv.config();
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const llm = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-3.5-turbo",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const prompt = new PromptTemplate({
  inputVariables: ["vibe"],
  template: `
You are a music recommendation assistant.

Given a user input "{vibe}", which can be either a mood (like "sad", "party", "nostalgic") or an artist (like "Drake", "Taylor Swift"), suggest 5 songs as a playlist.

Respond ONLY with a valid JSON array. Each object must include:
- "title"
- "artist"
- "genre"
- "reason" (why it fits the vibe)
- "link" (a Spotify link, or "#" if unknown)

Example format:
[
  {{
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "genre": "Pop",
    "reason": "It has an energetic 80s vibe",
    "link": "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b"
  }},
  ...
]

IMPORTANT: Return only the JSON array and nothing else.
`,
});

const chain = new LLMChain({ llm, prompt });

export async function getSongsByMood(vibe: string) {
  const result = await chain.call({ vibe });

  console.log("🔍 Raw LLM Output:", result.text); // Add this line for debugging

  try {
    const parsed = JSON.parse(result.text.trim());
    return parsed;
  } catch (e) {
    throw new Error("Failed to parse model response as JSON.");
  }
}
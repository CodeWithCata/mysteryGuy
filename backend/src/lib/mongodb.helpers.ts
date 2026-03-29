import { WordModel } from "../models/word.model";
import { GameWord } from "../schemas/word.schema";
import { Difficulty } from "../schemas/constants.schema";

// ─── Filter builder ───────────────────────────────────────────────────────────
export interface WordFilter {
  difficulty?: Difficulty;
  category?: string;
}

function buildWordFilter(filter: WordFilter): Record<string, any> {
  const query: Record<string, any> = {};
  if (filter.difficulty) query.difficulty = filter.difficulty;
  if (filter.category && filter.category !== "All") query.category = filter.category;
  return query;
}

// ─── Word helpers ─────────────────────────────────────────────────────────────

/**
 * Fetches a random word from MongoDB using $sample — atomic, no race condition.
 * Returns null if no words match the filter.
 */
export async function getRandomWord(filter: WordFilter): Promise<GameWord | null> {
  const query = buildWordFilter(filter);

  const [word] = await WordModel.aggregate<GameWord>([
    { $match: query },
    { $sample: { size: 1 } },
  ]);

  return word ?? null;
}

/**
 * Returns all distinct categories sorted alphabetically.
 * Useful for populating the category dropdown in the lobby UI.
 */
export async function getDistinctCategories(): Promise<string[]> {
  const categories = await WordModel.distinct("category");
  return (categories as string[]).sort();
}

/**
 * Checks if a word already exists in the DB (case-insensitive).
 * Useful for seeding scripts to avoid duplicates.
 */
export async function wordExists(word: string): Promise<boolean> {
  const found = await WordModel.findOne({
    word: word.toLowerCase().trim(),
  }).lean();
  return !!found;
}
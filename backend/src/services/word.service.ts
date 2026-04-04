// --- Shared Schemas & Constants ---
import { GameWord, Difficulty } from "@shared/index";

// --- Backend MongoDB Helpers (Internal only) ---
import { 
  getRandomWord, 
  getDistinctCategories, 
  wordExists as checkWordExists 
} from "@/lib/mongodb.helpers";

export async function getRandomWordPair(
  difficulty?: Difficulty,
  category?: string
): Promise<GameWord> {
  const word = await getRandomWord({ difficulty, category });

  if (!word) {
    throw new Error("No words found for the given filters.");
  }

  return word;
}

export async function getAvailableCategories(): Promise<string[]> {
  return getDistinctCategories();
}

export async function wordExists(word: string): Promise<boolean> {
  return checkWordExists(word);
}
import { WordModel } from "../models/word.model";
import { GameWord } from "../schemas/word.schema";
import { Difficulty } from "../schemas/constants.schema";

export class WordService {
  /**
   * Fetches a random word from MongoDB.
   * Accepts optional filters to respect room settings (difficulty, category).
   * Used in: socketHandler.ts → start_game
   */
  static async getRandomWordPair(
    difficulty?: Difficulty,
    category?: string
  ): Promise<GameWord> {
    const filter: Record<string, any> = {};

    if (difficulty) filter.difficulty = difficulty;
    if (category && category !== "All") filter.category = category;

    const count = await WordModel.countDocuments(filter);
    if (count === 0) {
      throw new Error("No words found for the given filters.");
    }

    const randomIndex = Math.floor(Math.random() * count);
    const word = await WordModel.findOne(filter).skip(randomIndex).lean();

    if (!word) throw new Error("Failed to retrieve word.");

    return word as GameWord;
  }

  /**
   * Returns all distinct categories in the DB.
   * Useful for populating the category dropdown in the lobby UI.
   */
  static async getAvailableCategories(): Promise<string[]> {
    const categories = await WordModel.distinct("category");
    return categories.sort();
  }

  /**
   * Checks if a word already exists in the DB.
   * Useful for seeding scripts to avoid duplicates.
   */
  static async wordExists(word: string): Promise<boolean> {
    const found = await WordModel.findOne({
      word: word.toLowerCase(),
    }).lean();
    return !!found;
  }
}
import { Schema, model } from "mongoose";
import { GameWord } from "@shared/index";

// Define the Mongoose schema
const wordSchema = new Schema<GameWord>({
  category: { 
    type: String, 
    required: true, 
    trim: true 
  },
  word: { 
    type: String, 
    required: true, 
    unique: true, // High importance: prevents duplicate game words
    trim: true 
  },
  hints: { 
    type: [String], 
    required: true,
    // Custom validator to match your Zod .length(3) rule at the DB level
 
  },
  difficulty: { 
    type: String, 
    required: true,
    // Ensure this matches your DifficultyEnum (e.g., "EASY", "MEDIUM", "HARD")
    uppercase: true 
  }
});

// Create the Model
export const WordModel = model<GameWord>("Word", wordSchema);
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  PORT: z.coerce.number().default(3000).refine((val) => val !== 0, {
    message: "PORT cannot be 0"
  }),

  // Database Connection Strings
  MONGO_URI: z.string().url({ message: "MONGO_URI must be a valid URL" }),
  REDIS_URL: z.string().url({ message: "REDIS_URL must be a valid URL" }),

  // Transform "http://localhost:5173,https://mygame.com" into a clean array
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3001") 
    .transform((s) => s.split(",")),
});

// Use .safeParse to handle errors gracefully before the app crashes
const parsed = envSchema.safeParse(process.env);
  
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

// Export the validated data
export const env = parsed.data;


export type Env = z.infer<typeof envSchema>;
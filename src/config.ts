import { z } from "zod";

export const configSchema = z.object({
  path: z.string().default("."),
  envPath: z.string().default(".env"),
  runOnStart: z.boolean().default(false),
  createDotEnv: z.boolean().default(false),
}); 

export type Config = z.infer<typeof configSchema>
import { z } from "zod";

export const configSchema = z.object({
  path: z.string().default("."),
  envPath: z.string().default(".env"),
  strict: z.boolean().default(false),
  json: z.boolean().default(false),
  runOnStart: z.boolean().default(false),
}); 

export type Config = z.infer<typeof configSchema>
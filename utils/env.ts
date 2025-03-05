import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  // Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
  client: {
    
  },
  
  // Server-side environment variables (not exposed to the browser)
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  },
  
  // For Next.js >= 13.4.4, you only need to destructure client variables
  experimental__runtimeEnv: {
    // Only add client-side variables here
    // Example: NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
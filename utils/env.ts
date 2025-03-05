import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  // Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
  client: {
    // Add client-side variables here when needed
    // Example: NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  
  // Server-side environment variables (not exposed to the browser)
  server: {
    // Session security
    SESSION_SECRET: z.string().min(32).default("i8xduf4hgn7mzr9a3qek1vwc4b2gj5n6"),
    
    // Node environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    
    // Twitter API credentials
    TWITTER_CLIENT_ID: z.string().min(1),
    TWITTER_CLIENT_SECRET: z.string().min(1),
    TWITTER_CALLBACK_URL: z.string().url().default("http://localhost:3000/api/connect/twitter/callback"),
    
  },
  
  // For Next.js >= 13.4.4, you only need to destructure client variables
  experimental__runtimeEnv: {
    // Only add client-side variables here
    // Example: NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
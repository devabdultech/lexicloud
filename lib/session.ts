import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { env } from '@/utils/env';
import { customAlphabet } from 'nanoid';

// Define the session data structure
export interface SessionData {
  // Twitter OAuth data
  twitter?: {
    state: string;
    codeVerifier: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    userId?: string;
    username?: string;
  };
  // Add other platforms here as needed
}

// Iron session configuration
const sessionOptions: SessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: 'lexicloud_session',
  cookieOptions: {
    // Secure in production, but allow HTTP in development
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

// Get the session data from the request
export async function getSession() {
  const cookieHeader = await cookies();
  const session = await getIronSession<SessionData>(cookieHeader, sessionOptions);
  
  // Initialize session data if it doesn't exist
  if (!session.twitter) {
    session.twitter = {
      state: '',
      codeVerifier: '',
    };
  }
  
  return session;
}

/**
 * Generate a cryptographically secure random string for OAuth state and code verifier
 * Uses nanoid which is optimized for generating URL-friendly unique identifiers
 */
export function generateRandomString(length: number): string {
  // Use URL-safe characters (A-Za-z0-9_-) for OAuth compatibility
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
}

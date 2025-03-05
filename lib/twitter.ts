import { TwitterApi } from 'twitter-api-v2';
import { env } from '@/utils/env';

// Scopes needed for the application
const TWITTER_SCOPES = [
  'tweet.read',
  'users.read',
  'offline.access'
];

/**
 * Generate Twitter OAuth2 authorization URL
 * This URL is where users will be redirected to authorize your app
 */
export function getTwitterAuthUrl(state: string): string {
  if (!env.TWITTER_CLIENT_ID) {
    throw new Error('Twitter Client ID is not configured');
  }

  const client = new TwitterApi({
    clientId: env.TWITTER_CLIENT_ID,
    clientSecret: env.TWITTER_CLIENT_SECRET,
  });

  return client.generateOAuth2AuthLink(
    env.TWITTER_CALLBACK_URL,
    { 
      scope: TWITTER_SCOPES,
      state 
    }
  ).url;
}

/**
 * Exchange authorization code for access token
 * Called after the user authorizes your app and is redirected back
 */
export async function getTwitterAccessToken(code: string, codeVerifier: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  if (!env.TWITTER_CLIENT_ID || !env.TWITTER_CLIENT_SECRET) {
    throw new Error('Twitter API credentials are not configured');
  }

  const client = new TwitterApi({
    clientId: env.TWITTER_CLIENT_ID,
    clientSecret: env.TWITTER_CLIENT_SECRET,
  });

  const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: env.TWITTER_CALLBACK_URL,
  });

  return {
    accessToken,
    refreshToken: refreshToken ?? undefined,
    expiresIn,
  };
}

/**
 * Create a Twitter API client using an access token
 */
export function createTwitterClient(accessToken: string): TwitterApi {
  return new TwitterApi(accessToken);
}

/**
 * Refresh an expired access token using a refresh token
 */
export async function refreshTwitterToken(refreshToken: string | undefined): Promise<{
  accessToken: string;
  refreshToken: string | undefined;
  expiresIn: number;
}> {
  if (!env.TWITTER_CLIENT_ID || !env.TWITTER_CLIENT_SECRET) {
    throw new Error('Twitter API credentials are not configured');
  }

  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const client = new TwitterApi({
    clientId: env.TWITTER_CLIENT_ID,
    clientSecret: env.TWITTER_CLIENT_SECRET,
  });

  const { accessToken, refreshToken: newRefreshToken, expiresIn } = 
    await client.refreshOAuth2Token(refreshToken);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn,
  };
}

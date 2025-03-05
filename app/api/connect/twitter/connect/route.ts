import { NextRequest, NextResponse } from 'next/server';
import { getTwitterAuthUrl } from '@/lib/twitter';
import { getSession, generateRandomString } from '@/lib/session';

/**
 * Twitter OAuth connection route
 * 
 * This route initiates the Twitter OAuth flow by:
 * 1. Generating a secure state and code verifier
 * 2. Storing them in the user's session
 * 3. Redirecting the user to Twitter's authorization page
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user's session
    const session = await getSession();
    
    // Generate random strings for OAuth security
    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(64);
    
    // Store the state and code verifier in the session
    session.twitter = {
      state,
      codeVerifier,
    };
    
    // Save the session
    await session.save();
    
    // Generate the Twitter authorization URL
    const authUrl = getTwitterAuthUrl(state);
    
    // Redirect the user to Twitter's authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Twitter OAuth flow:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to connect to Twitter' },
      { status: 500 }
    );
  }
}

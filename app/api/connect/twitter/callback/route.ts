import { NextRequest, NextResponse } from 'next/server';
import { getTwitterAccessToken, createTwitterClient } from '@/lib/twitter';
import { getSession } from '@/lib/session';

/**
 * Twitter OAuth callback route
 * 
 * This route handles the callback from Twitter after user authorization by:
 * 1. Verifying the state parameter to prevent CSRF attacks
 * 2. Exchanging the authorization code for access tokens
 * 3. Storing the tokens in the user's session
 * 4. Fetching basic user information
 * 5. Redirecting back to the application
 */
export async function GET(request: NextRequest) {
  try {
    // Get URL parameters from the callback
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Get the user's session
    const session = await getSession();
    
    // Check if there was an error or if the session doesn't exist
    if (error || !session.twitter) {
      console.error('Twitter OAuth error:', error || 'No session found');
      return NextResponse.redirect(new URL('/?error=twitter_auth_failed', request.url));
    }
    
    // Verify the state parameter to prevent CSRF attacks
    if (!state || state !== session.twitter.state) {
      console.error('Twitter OAuth state mismatch');
      return NextResponse.redirect(new URL('/?error=twitter_state_mismatch', request.url));
    }
    
    // Ensure we have the code and code verifier
    if (!code || !session.twitter.codeVerifier) {
      console.error('Missing code or code verifier');
      return NextResponse.redirect(new URL('/?error=twitter_missing_params', request.url));
    }
    
    // Exchange the authorization code for access tokens
    const { accessToken, refreshToken, expiresIn } = await getTwitterAccessToken(
      code,
      session.twitter.codeVerifier
    );
    
    // Create a Twitter client with the access token
    const twitterClient = createTwitterClient(accessToken);
    
    // Get the user's information
    const user = await twitterClient.v2.me({
      'user.fields': ['id', 'name', 'username']
    });
    
    // Store the tokens and user information in the session
    session.twitter = {
      ...session.twitter,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      userId: user.data.id,
      username: user.data.username,
    };
    
    // Save the session
    await session.save();
    
    // Redirect back to the application
    return NextResponse.redirect(new URL('/?connected=twitter', request.url));
  } catch (error) {
    console.error('Error handling Twitter OAuth callback:', error);
    
    // Redirect with an error
    return NextResponse.redirect(new URL('/?error=twitter_callback_failed', request.url));
  }
}

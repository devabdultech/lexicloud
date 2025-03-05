import { NextRequest, NextResponse } from 'next/server';
import { createTwitterClient, refreshTwitterToken } from '@/lib/twitter';
import { getSession } from '@/lib/session';

/**
 * Fetch Twitter data route
 * 
 * This route retrieves the user's tweets and replies by:
 * 1. Checking if the user is connected to Twitter
 * 2. Refreshing the access token if needed
 * 3. Fetching tweets and replies from the Twitter API
 * 4. Returning the data for analysis
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user's session
    const session = await getSession();
    
    // Check if the user is connected to Twitter
    if (!session.twitter?.accessToken || !session.twitter?.userId) {
      return NextResponse.json(
        { error: 'Not connected to Twitter' },
        { status: 401 }
      );
    }
    
    // Check if the token is expired and refresh if needed
    if (session.twitter.expiresAt && session.twitter.expiresAt < Date.now() && session.twitter.refreshToken) {
      try {
        const { accessToken, refreshToken, expiresIn } = await refreshTwitterToken(
          session.twitter.refreshToken
        );
        
        // Update the tokens in the session
        session.twitter = {
          ...session.twitter,
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
        };
        
        // Save the session
        await session.save();
      } catch (error) {
        console.error('Error refreshing Twitter token:', error);
        return NextResponse.json(
          { error: 'Failed to refresh Twitter token' },
          { status: 401 }
        );
      }
    }

    const accessToken = session.twitter.accessToken as string;
    const userId = session.twitter.userId as string;
    
    // Create a Twitter client with the access token
    const twitterClient = createTwitterClient(accessToken);
    
    // Get the search parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const includeReplies = searchParams.get('includeReplies') === 'true';
    
    // Fetch the user's tweets
    const tweets = await twitterClient.v2.userTimeline(userId, {
      max_results: limit,
      'tweet.fields': ['created_at', 'text', 'public_metrics', 'conversation_id'],
      exclude: includeReplies ? [] : ['replies'],
    });
    
    // Return the tweets
    return NextResponse.json({
      success: true,
      data: {
        tweets: tweets.data.data || [],
        meta: tweets.data.meta,
      },
    });
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter data' },
      { status: 500 }
    );
  }
}

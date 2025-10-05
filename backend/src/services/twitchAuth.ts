import jwt from 'jsonwebtoken';
import axios from 'axios';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const EXTENSION_SECRET = process.env.TWITCH_EXTENSION_SECRET!;

export interface TwitchTokenPayload {
  user_id: string;
  channel_id: string;
  role: 'broadcaster' | 'moderator' | 'viewer';
  opaque_user_id?: string;
  pubsub_perms?: {
    listen: string[];
    send: string[];
  };
}

/**
 * Verify Twitch Extension JWT token
 */
export const verifyTwitchToken = (token: string): TwitchTokenPayload => {
  // Development mode - allow mock tokens
  if (process.env.NODE_ENV === 'development' && token === 'mock_token_for_development') {
    console.log('[Auth] Using mock token for development');
    return {
      user_id: 'dev_user_123',
      channel_id: 'dev_channel_123',
      role: 'broadcaster',
    };
  }

  try {
    console.log('[Auth] Verifying Twitch JWT token...');
    console.log('[Auth] Extension secret length:', EXTENSION_SECRET?.length);
    console.log('[Auth] Token prefix:', token?.substring(0, 20));
    
    const decoded = jwt.verify(token, Buffer.from(EXTENSION_SECRET, 'base64'), {
      algorithms: ['HS256'],
    }) as TwitchTokenPayload;
    
    console.log('[Auth] Token verified successfully for user:', decoded.user_id);
    return decoded;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    throw new Error('Invalid Twitch token');
  }
};

/**
 * Get app access token for Twitch API calls
 */
export const getAppAccessToken = async (): Promise<string> => {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get app access token:', error);
    throw new Error('Failed to authenticate with Twitch');
  }
};

/**
 * Validate user token with Twitch
 */
export const validateUserToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    });
    
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Get user info from Twitch
 */
export const getTwitchUser = async (userId: string, accessToken: string) => {
  try {
    const response = await axios.get(`https://api.twitch.tv/helix/users?id=${userId}`, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return response.data.data[0];
  } catch (error) {
    console.error('Failed to get Twitch user:', error);
    throw new Error('Failed to fetch user data');
  }
};

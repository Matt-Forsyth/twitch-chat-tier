import { TwitchAuth } from '../types';

declare global {
  interface Window {
    Twitch?: {
      ext: {
        onAuthorized: (callback: (auth: any) => void) => void;
        onContext: (callback: (context: any) => void) => void;
        configuration: {
          broadcaster?: {
            content: string;
          };
          set: (segment: string, version: string, content: string) => void;
        };
        viewer: {
          role: string;
          id: string;
        };
      };
    };
  }
}

class TwitchExtension {
  private auth: TwitchAuth | null = null;
  private onAuthCallbacks: ((auth: TwitchAuth) => void)[] = [];

  init() {
    if (window.Twitch?.ext) {
      window.Twitch.ext.onAuthorized((auth: any) => {
        this.auth = {
          token: auth.token,
          userId: auth.userId,
          channelId: auth.channelId,
          role: auth.role as 'broadcaster' | 'moderator' | 'viewer',
        };

        // Notify all callbacks
        this.onAuthCallbacks.forEach((callback) => callback(this.auth!));
      });
    } else {
      // Development mode - use mock auth
      console.warn('Twitch Extension Helper not found. Using mock auth for development.');
      
      const mockAuth: TwitchAuth = {
        token: 'mock_token_for_development',
        userId: 'dev_user_123',
        channelId: 'dev_channel_123',
        role: 'broadcaster',
      };
      
      this.auth = mockAuth;
      setTimeout(() => {
        this.onAuthCallbacks.forEach((callback) => callback(mockAuth));
      }, 100);
    }
  }

  onAuthorized(callback: (auth: TwitchAuth) => void) {
    if (this.auth) {
      callback(this.auth);
    } else {
      this.onAuthCallbacks.push(callback);
    }
  }

  getAuth(): TwitchAuth | null {
    return this.auth;
  }

  setBroadcasterConfig(content: string) {
    if (window.Twitch?.ext.configuration) {
      window.Twitch.ext.configuration.set('broadcaster', '1.0', content);
    }
  }

  getBroadcasterConfig(): string | null {
    if (window.Twitch?.ext.configuration.broadcaster) {
      return window.Twitch.ext.configuration.broadcaster.content;
    }
    return null;
  }
}

export const twitchExt = new TwitchExtension();

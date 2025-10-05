import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { twitchExt } from './utils/twitch';
import { apiClient } from './utils/api';
import { wsClient } from './utils/websocket';
import { TierListConfig, TierListResults } from './types';
import './styles/global.css';

const OBSOverlay: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tierList, setTierList] = useState<TierListConfig | null>(null);
  const [results, setResults] = useState<TierListResults | null>(null);

  useEffect(() => {
    // Get channel ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const channelParam = urlParams.get('channel');
    
    console.log('[OBS Overlay] URL:', window.location.href);
    console.log('[OBS Overlay] Channel param:', channelParam);
    
    if (channelParam) {
      // OBS mode with channel parameter
      console.log('[OBS Overlay] Running in OBS mode with channel:', channelParam);
      initWithChannel(channelParam);
    } else {
      // Twitch extension mode
      console.log('[OBS Overlay] Running in Twitch extension mode');
      twitchExt.init();
      
      twitchExt.onAuthorized(async (auth) => {
        apiClient.setToken(auth.token);
        wsClient.connect(auth.token);
        
        await loadActiveTierList(auth.channelId);
        
        // Listen for vote updates
        wsClient.on('vote_update', async (data: any) => {
          if (tierList && data.tierListId === tierList._id) {
            await loadResults(tierList._id);
          }
        });
        
        wsClient.on('tierlist_activated', async () => {
          await loadActiveTierList(auth.channelId);
        });
      });
    }
  }, []);

  const initWithChannel = async (channel: string) => {
    // For OBS use - poll for updates every 5 seconds
    await loadActiveTierList(channel);
    
    setInterval(async () => {
      await loadActiveTierList(channel);
    }, 5000);
  };

  const loadActiveTierList = async (channel: string) => {
    try {
      console.log('[OBS Overlay] Loading tier lists for channel:', channel);
      console.log('[OBS Overlay] API URL:', import.meta.env.VITE_API_URL);
      setLoading(true);
      const lists = await apiClient.getTierListsByChannel(channel);
      console.log('[OBS Overlay] Found tier lists:', lists);
      console.log('[OBS Overlay] Number of tier lists:', lists.length);
      
      const active = lists.find((list: TierListConfig) => list.status === 'active');
      console.log('[OBS Overlay] Active tier list:', active);
      
      if (active) {
        console.log('[OBS Overlay] Setting active tier list:', active.title);
        setTierList(active);
        await loadResults(active._id);
      } else {
        console.log('[OBS Overlay] No active tier list found');
        setTierList(null);
        setResults(null);
      }
    } catch (err) {
      console.error('[OBS Overlay] Failed to load tier list:', err);
      console.error('[OBS Overlay] Error details:', err instanceof Error ? err.message : err);
    } finally {
      console.log('[OBS Overlay] Setting loading to false');
      setLoading(false);
    }
  };

  const loadResults = async (tierListId: string) => {
    try {
      const data = await apiClient.getTierListResults(tierListId);
      setResults(data);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'transparent'
      }}>
        <div style={{ 
          fontSize: '24px', 
          color: '#fff',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!tierList || !results) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'transparent'
      }}>
        <div style={{ 
          fontSize: '24px', 
          color: '#fff',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          textAlign: 'center',
          padding: '40px'
        }}>
          No Active Tier List
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px',
      background: 'transparent',
      minHeight: '100vh'
    }}>
      {/* Title */}
      <h1 style={{ 
        textAlign: 'center',
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
        marginBottom: '40px'
      }}>
        {tierList.title}
      </h1>

      {/* Tier List Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {tierList.tiers.map((tier) => {
          // Get items that belong to this tier
          const itemsInTier = results.results
            .filter((result) => result.averageTier === tier)
            .sort((a, b) => b.totalVotes - a.totalVotes);
          
          return (
            <div key={tier} style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Tier Label */}
              <div style={{
                backgroundColor: getTierColor(tier),
                color: '#000',
                fontSize: '48px',
                fontWeight: 'bold',
                padding: '20px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '120px',
                boxShadow: '3px 3px 10px rgba(0,0,0,0.5)',
                border: '3px solid #000'
              }}>
                {tier}
              </div>

              {/* Items in Tier */}
              <div style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                border: '3px solid #000',
                borderLeft: 'none',
                padding: '15px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                alignItems: 'center',
                minHeight: '100px',
                boxShadow: '3px 3px 10px rgba(0,0,0,0.5)'
              }}>
                {itemsInTier.length === 0 ? (
                  <span style={{ 
                    color: '#999', 
                    fontSize: '20px',
                    fontStyle: 'italic'
                  }}>
                    No items yet
                  </span>
                ) : (
                  itemsInTier.map((result) => (
                    <div key={result.item.id} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '15px 25px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      {result.item.imageUrl && (
                        <img 
                          src={result.item.imageUrl} 
                          alt={result.item.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid rgba(255, 255, 255, 0.5)'
                          }}
                        />
                      )}
                      <span style={{ 
                        color: '#fff',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        textAlign: 'center'
                      }}>
                        {result.item.name}
                      </span>
                      <span style={{ 
                        color: getTierColor(tier),
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {result.totalVotes} {result.totalVotes === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Votes */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        fontSize: '24px',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        Total Voters: {results.totalVoters}
      </div>
    </div>
  );
};

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'S': '#ff7f7f',
    'A': '#ffbf7f',
    'B': '#ffff7f',
    'C': '#7fff7f',
    'D': '#7fbfff',
    'F': '#bf7fff',
  };
  return colors[tier] || '#808080';
}

const root = createRoot(document.getElementById('root')!);
root.render(<OBSOverlay />);

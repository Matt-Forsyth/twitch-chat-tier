import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { twitchExt } from './utils/twitch';
import { apiClient } from './utils/api';
import { wsClient } from './utils/websocket';
import { TierListConfig, ItemVote } from './types';
import './styles/global.css';

const Panel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierList, setTierList] = useState<TierListConfig | null>(null);
  const [userVotes, setUserVotes] = useState<Map<string, string>>(new Map());
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    twitchExt.init();
    
    twitchExt.onAuthorized(async (auth) => {
      apiClient.setToken(auth.token);
      wsClient.connect(auth.token);
      
      await loadActiveTierList();
    });
  }, []);

  const loadActiveTierList = async () => {
    try {
      setLoading(true);
      const tierLists = await apiClient.getTierLists();
      const active = tierLists.find((tl: TierListConfig) => tl.status === 'active');
      
      if (active) {
        setTierList(active);
        await loadUserVote(active._id);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load tier list');
    } finally {
      setLoading(false);
    }
  };

  const loadUserVote = async (tierListId: string) => {
    try {
      const vote = await apiClient.getUserVote(tierListId);
      const voteMap = new Map<string, string>();
      vote.votes.forEach((v: ItemVote) => {
        voteMap.set(v.itemId, v.tier);
      });
      setUserVotes(voteMap);
      setHasVoted(true);
    } catch (err) {
      // No vote found yet
      setHasVoted(false);
    }
  };

  const handleItemClick = (itemId: string, tier: string) => {
    if (hasVoted) return; // Can't change vote after submission
    
    const newVotes = new Map(userVotes);
    newVotes.set(itemId, tier);
    setUserVotes(newVotes);
  };

  const handleSubmit = async () => {
    if (!tierList || userVotes.size === 0) return;
    
    try {
      setSubmitting(true);
      const votes: ItemVote[] = Array.from(userVotes.entries()).map(([itemId, tier]) => ({
        itemId,
        tier,
      }));
      
      await apiClient.submitVote(tierList._id, votes);
      setHasVoted(true);
      setError(null);
      
      // Notify via WebSocket
      wsClient.send('vote_update', { tierListId: tierList._id });
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!tierList) {
    return (
      <div className="container">
        <div className="card">
          <h2>No Active Tier List</h2>
          <p>The streamer hasn't started a tier list yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  const allItemsVoted = tierList.items.length === userVotes.size;

  return (
    <div className="container">
      <div className="card">
        <h1>{tierList.title}</h1>
        {error && <div className="error">{error}</div>}
        {hasVoted && <div className="success">Your vote has been submitted!</div>}
        
        <p style={{ color: 'var(--twitch-text-alt)', marginBottom: '20px' }}>
          {hasVoted 
            ? 'You have already voted. Thank you for participating!' 
            : 'Click on each item to assign it to a tier, then submit your vote.'}
        </p>

        <div style={{ marginBottom: '20px' }}>
          {tierList.tiers.map((tier) => (
            <div key={tier} className="tier-container">
              <div 
                className="tier-label" 
                style={{ 
                  backgroundColor: getTierColor(tier),
                  color: '#000'
                }}
              >
                {tier}
              </div>
              <div className="tier-items">
                {tierList.items.map((item) => {
                  const itemTier = userVotes.get(item.id);
                  if (itemTier !== tier) return null;
                  
                  return (
                    <div key={item.id} className="tier-item selected">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                      <span className="tier-item-name">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!hasVoted && (
          <>
            <h3>Select tiers for items:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {tierList.items.map((item) => {
                const currentTier = userVotes.get(item.id);
                
                return (
                  <div key={item.id} style={{ border: '1px solid var(--twitch-border)', borderRadius: '4px', padding: '10px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div style={{ marginTop: '5px', fontSize: '14px' }}>{item.name}</div>
                      {currentTier && (
                        <div style={{ 
                          marginTop: '5px', 
                          fontSize: '12px', 
                          color: 'var(--twitch-purple)',
                          fontWeight: 'bold'
                        }}>
                          Current: {currentTier}
                        </div>
                      )}
                    </div>
                    <select 
                      value={currentTier || ''} 
                      onChange={(e) => handleItemClick(item.id, e.target.value)}
                      className="input"
                      style={{ width: '100%', padding: '5px' }}
                    >
                      <option value="">Select tier</option>
                      {tierList.tiers.map((tier) => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <button 
              className="button" 
              onClick={handleSubmit} 
              disabled={!allItemsVoted || submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Submitting...' : 'Submit Your Vote'}
            </button>
            {!allItemsVoted && (
              <p style={{ color: 'var(--twitch-text-alt)', marginTop: '10px', textAlign: 'center' }}>
                Please vote for all {tierList.items.length} items before submitting
              </p>
            )}
          </>
        )}
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
root.render(<Panel />);

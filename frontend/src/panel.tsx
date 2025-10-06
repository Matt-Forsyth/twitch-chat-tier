import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionName, setSuggestionName] = useState('');
  const [suggestionImage, setSuggestionImage] = useState('');
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'myVote' | 'results'>('myVote');
  const [results, setResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);

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

  const handleDragEnd = (result: DropResult) => {
    // Allow dragging unvoted items even if user has already voted
    if (!result.destination) return;
    
    const itemId = result.draggableId;
    const tier = result.destination.droppableId;
    
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
      
      // Load results after voting
      await loadResults();
      
      // Notify via WebSocket
      wsClient.send('vote_update', { tierListId: tierList._id });
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const loadResults = async () => {
    if (!tierList) return;
    
    try {
      setLoadingResults(true);
      const data = await apiClient.getTierListResults(tierList._id);
      setResults(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSuggestionSubmit = async () => {
    if (!tierList || !suggestionName.trim()) return;
    
    try {
      setSuggestionSubmitting(true);
      await apiClient.createSuggestion(tierList._id, suggestionName.trim(), suggestionImage.trim() || undefined);
      setSuggestionName('');
      setSuggestionImage('');
      setShowSuggestionForm(false);
      alert('Suggestion submitted! The broadcaster will review it.');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit suggestion');
    } finally {
      setSuggestionSubmitting(false);
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
  const unvotedItems = tierList.items.filter(item => !userVotes.has(item.id));
  const hasNewItems = hasVoted && unvotedItems.length > 0;

  return (
    <div className="container">
      <div className="card">
        <h1>{tierList.title}</h1>
        {error && <div className="error">{error}</div>}
        {hasVoted && !hasNewItems && <div className="success">Your vote has been submitted!</div>}
        {hasNewItems && (
          <div style={{
            backgroundColor: 'rgba(145, 71, 255, 0.2)',
            border: '1px solid #9147ff',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            color: 'var(--twitch-text)',
          }}>
            🆕 New items have been added! You can vote on them below.
          </div>
        )}
        
        <p style={{ color: 'var(--twitch-text-alt)', marginBottom: '20px' }}>
          {hasVoted && !hasNewItems
            ? 'You have already voted. Thank you for participating!' 
            : hasNewItems
            ? `${unvotedItems.length} new item${unvotedItems.length > 1 ? 's' : ''} to rate! Drag them to tiers to update your vote.`
            : 'Drag items to tiers or use dropdowns to assign ratings, then submit your vote.'}
        </p>

        {(!hasVoted || hasNewItems) && (
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* Tier containers */}
            <div style={{ marginBottom: '20px' }}>
              {tierList.tiers.map((tier) => (
                <Droppable key={tier} droppableId={tier} direction="horizontal">
                  {(provided, snapshot) => (
                    <div 
                      className="tier-container"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(145, 71, 255, 0.1)' : undefined,
                      }}
                    >
                      <div 
                        className="tier-label" 
                        style={{ 
                          backgroundColor: getTierColor(tier),
                          color: '#000'
                        }}
                      >
                        {tier}
                      </div>
                      <div className="tier-items" style={{ minHeight: '60px', display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '5px' }}>
                        {tierList.items
                          .filter(item => userVotes.get(item.id) === tier)
                          .map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="tier-item selected"
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                    cursor: 'grab',
                                  }}
                                >
                                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                                  <span className="tier-item-name">{item.name}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>

            {/* Unvoted items pool */}
            {unvotedItems.length > 0 && (
              <Droppable droppableId="unvoted" direction="horizontal">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ 
                      border: '2px dashed var(--twitch-border)', 
                      borderRadius: '4px', 
                      padding: '15px', 
                      marginBottom: '20px',
                      minHeight: '80px'
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>Items to Rate:</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {unvotedItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="tier-item"
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                                cursor: 'grab',
                                border: '2px solid var(--twitch-border)',
                              }}
                            >
                              {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                              <span className="tier-item-name">{item.name}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            )}
          </DragDropContext>
        )}

        {/* Voted items display (after submission) */}
        {hasVoted && (
          <>
            {/* Toggle View Button */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', justifyContent: 'center' }}>
              <button 
                className={viewMode === 'myVote' ? 'button' : 'button button-secondary'}
                onClick={() => setViewMode('myVote')}
                style={{ flex: 1 }}
              >
                📝 My Vote
              </button>
              <button 
                className={viewMode === 'results' ? 'button' : 'button button-secondary'}
                onClick={() => {
                  setViewMode('results');
                  if (!results) loadResults();
                }}
                style={{ flex: 1 }}
              >
                📊 Current Results
              </button>
            </div>

            {/* My Vote View */}
            {viewMode === 'myVote' && (
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
            )}

            {/* Results View */}
            {viewMode === 'results' && (
              <div style={{ marginBottom: '20px' }}>
                {loadingResults ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>Loading results...</div>
                ) : results ? (
                  <>
                    <p style={{ textAlign: 'center', color: 'var(--twitch-text-alt)', marginBottom: '15px' }}>
                      Total Voters: {results.totalVoters}
                    </p>
                    {tierList.tiers.map((tier) => {
                      const tierResults = results.results.filter((r: any) => r.averageTier === tier);
                      return (
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
                            {tierResults.map((result: any) => (
                              <div key={result.item.id} className="tier-item selected">
                                {result.item.imageUrl && <img src={result.item.imageUrl} alt={result.item.name} />}
                                <span className="tier-item-name">{result.item.name}</span>
                                <span style={{ fontSize: '11px', color: 'var(--twitch-text-alt)', display: 'block', marginTop: '3px' }}>
                                  {result.totalVotes} votes
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--twitch-text-alt)' }}>
                    Click "Current Results" to see how others voted
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {(!hasVoted || hasNewItems) && (
          <>
            <button 
              className="button" 
              onClick={handleSubmit} 
              disabled={(!allItemsVoted && !hasNewItems) || submitting}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              {submitting ? 'Submitting...' : hasNewItems ? 'Update Your Vote' : 'Submit Your Vote'}
            </button>
            {!allItemsVoted && !hasNewItems && (
              <p style={{ color: 'var(--twitch-text-alt)', textAlign: 'center' }}>
                Please vote for all {tierList.items.length} items before submitting ({unvotedItems.length} remaining)
              </p>
            )}
            {hasNewItems && unvotedItems.length > 0 && (
              <p style={{ color: 'var(--twitch-text-alt)', textAlign: 'center' }}>
                {unvotedItems.length} new item{unvotedItems.length > 1 ? 's' : ''} to rate
              </p>
            )}
          </>
        )}

        {/* Suggestion form */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--twitch-border)', paddingTop: '15px' }}>
          {!showSuggestionForm ? (
            <button 
              className="button button-secondary" 
              onClick={() => setShowSuggestionForm(true)}
              style={{ width: '100%' }}
            >
              💡 Suggest an Item
            </button>
          ) : (
            <div>
              <h3>Suggest an Item</h3>
              <input
                type="text"
                className="input"
                placeholder="Item name"
                value={suggestionName}
                onChange={(e) => setSuggestionName(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <input
                type="text"
                className="input"
                placeholder="Image URL (optional)"
                value={suggestionImage}
                onChange={(e) => setSuggestionImage(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="button" 
                  onClick={handleSuggestionSubmit}
                  disabled={!suggestionName.trim() || suggestionSubmitting}
                  style={{ flex: 1 }}
                >
                  {suggestionSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
                <button 
                  className="button button-secondary" 
                  onClick={() => {
                    setShowSuggestionForm(false);
                    setSuggestionName('');
                    setSuggestionImage('');
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Buy Me a Coffee */}
      <div style={{ textAlign: 'center', padding: '15px 0', borderTop: '1px solid var(--twitch-border)', marginTop: '20px' }}>
        <a 
          href="https://buymeacoffee.com/matthewforsyth" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            color: 'var(--twitch-text-alt)',
            textDecoration: 'none',
            fontSize: '12px',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--twitch-purple)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--twitch-text-alt)'}
        >
          <span style={{ fontSize: '16px' }}>☕</span>
          <span>Support the dev</span>
        </a>
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

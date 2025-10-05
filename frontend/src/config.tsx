import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { twitchExt } from './utils/twitch';
import { apiClient } from './utils/api';
import { TierListConfig, TierListItem, TierListResults } from './types';
import './styles/global.css';

const Config: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string>('');
  const [tierLists, setTierLists] = useState<TierListConfig[]>([]);
  const [selectedTierList, setSelectedTierList] = useState<TierListConfig | null>(null);
  const [results, setResults] = useState<TierListResults | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<TierListItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemImage, setNewItemImage] = useState('');

  useEffect(() => {
    console.log('[Config] Component mounted');
    console.log('[Config] Window.Twitch:', window.Twitch);
    console.log('[Config] API URL:', import.meta.env.VITE_API_URL);
    
    twitchExt.init();
    
    twitchExt.onAuthorized(async (auth) => {
      console.log('[Config] Auth received:', { role: auth.role, userId: auth.userId, channelId: auth.channelId });
      
      setChannelId(auth.channelId);
      console.log('[Config] Channel ID set to:', auth.channelId);
      
      if (auth.role !== 'broadcaster') {
        setError('Only broadcasters can access this page');
        setLoading(false);
        return;
      }
      
      apiClient.setToken(auth.token);
      await loadTierLists();
    });
  }, []);

  const loadTierLists = async () => {
    try {
      console.log('[Config] Loading tier lists...');
      setLoading(true);
      const data = await apiClient.getTierLists();
      console.log('[Config] Tier lists loaded:', data);
      console.log('[Config] Tier list statuses:', data.map((t: TierListConfig) => ({ id: t._id, title: t.title, status: t.status })));
      setTierLists(data);
      setError(null);
    } catch (err: any) {
      console.error('[Config] Failed to load tier lists:', err);
      setError(err.message || 'Failed to load tier lists');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (tierListId: string) => {
    try {
      const data = await apiClient.getTierListResults(tierListId);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: TierListItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      imageUrl: newItemImage.trim() || undefined,
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemImage('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCreateTierList = async () => {
    if (!title.trim() || items.length === 0) {
      setError('Please provide a title and at least one item');
      return;
    }
    
    try {
      await apiClient.createTierList({ title, items });
      setTitle('');
      setItems([]);
      setShowCreateForm(false);
      await loadTierLists();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create tier list');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await apiClient.activateTierList(id);
      await loadTierLists();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to activate tier list');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await apiClient.completeTierList(id);
      await loadTierLists();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to complete tier list');
    }
  };

  const handleReset = async (id: string) => {
    if (!confirm('Are you sure you want to reset all votes?')) return;
    
    try {
      await apiClient.resetTierListVotes(id);
      if (results?.tierList._id === id) {
        await loadResults(id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reset votes');
    }
  };

  const handleDelete = async (id: string) => {
    console.log('[Config] Delete button clicked for tier list:', id);
    
    if (!confirm('Are you sure you want to delete this tier list? This action cannot be undone and will delete all associated votes.')) {
      console.log('[Config] Delete cancelled by user');
      return;
    }
    
    console.log('[Config] Deleting tier list:', id);
    try {
      const result = await apiClient.deleteTierList(id);
      console.log('[Config] Delete successful:', result);
      
      // Close results view if we deleted the currently viewed tier list
      if (selectedTierList?._id === id) {
        setSelectedTierList(null);
        setResults(null);
      }
      
      // Refresh the tier list
      await loadTierLists();
      setError(null);
    } catch (err: any) {
      console.error('[Config] Delete failed:', err);
      console.error('[Config] Error details:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Failed to delete tier list');
    }
  };

  const handleViewResults = async (tierList: TierListConfig) => {
    setSelectedTierList(tierList);
    await loadResults(tierList._id);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error && tierLists.length === 0) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="container">
        <div className="card">
          <h1>Create New Tier List</h1>
          {error && <div className="error">{error}</div>}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
            <input 
              type="text" 
              className="input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Best Video Games of All Time"
            />
          </div>

          <h3>Items</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              className="input" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <input 
              type="text" 
              className="input" 
              value={newItemImage} 
              onChange={(e) => setNewItemImage(e.target.value)}
              placeholder="Image URL (optional)"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <button className="button" onClick={handleAddItem}>Add Item</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {items.map((item) => (
              <div key={item.id} className="card" style={{ padding: '10px', position: 'relative' }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '5px' }} />
                )}
                <div style={{ fontSize: '14px', marginBottom: '10px' }}>{item.name}</div>
                <button 
                  className="button button-danger" 
                  onClick={() => handleRemoveItem(item.id)}
                  style={{ width: '100%', padding: '5px', fontSize: '12px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="button" onClick={handleCreateTierList} disabled={items.length === 0}>
              Create Tier List
            </button>
            <button className="button button-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTierList && results) {
    const groupedResults = results.results.reduce((acc, result) => {
      if (!acc[result.averageTier]) {
        acc[result.averageTier] = [];
      }
      acc[result.averageTier].push(result);
      return acc;
    }, {} as Record<string, typeof results.results>);

    return (
      <div className="container">
        <div className="card">
          <button className="button button-secondary" onClick={() => setSelectedTierList(null)}>
            ← Back to List
          </button>
          
          <h1>{selectedTierList.title} - Results</h1>
          <p style={{ color: 'var(--twitch-text-alt)' }}>
            Total Voters: {results.totalVoters}
          </p>

          <div style={{ marginTop: '20px' }}>
            {selectedTierList.tiers.map((tier) => (
              <div key={tier} className="tier-container">
                <div 
                  className="tier-label" 
                  style={{ backgroundColor: getTierColor(tier), color: '#000' }}
                >
                  {tier}
                </div>
                <div className="tier-items">
                  {(groupedResults[tier] || []).map((result) => (
                    <div key={result.item.id} className="tier-item">
                      {result.item.imageUrl && <img src={result.item.imageUrl} alt={result.item.name} />}
                      <span className="tier-item-name">{result.item.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--twitch-text-alt)' }}>
                        {result.totalVotes} votes
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeTierList = tierLists.find(tl => tl.status === 'active');

  return (
    <div className="container">
      <div className="card">
        <h1>Tier List Manager</h1>
        {channelId && (
          <p style={{ fontSize: '12px', color: 'var(--twitch-text-alt)', marginBottom: '10px' }}>
            Channel ID: {channelId}
          </p>
        )}
        {error && <div className="error">{error}</div>}
        
        <button className="button" onClick={() => setShowCreateForm(true)} style={{ marginBottom: '20px' }}>
          Create New Tier List
        </button>

        {activeTierList && (
          <div className="card" style={{ backgroundColor: 'rgba(145, 71, 255, 0.1)', borderColor: 'var(--twitch-purple)' }}>
            <h3>🔴 Currently Active</h3>
            <h2>{activeTierList.title}</h2>
            <p style={{ color: 'var(--twitch-text-alt)' }}>
              {activeTierList.items.length} items · Started {new Date(activeTierList.startTime!).toLocaleString()}
            </p>
            
            {/* OBS Browser Source URL */}
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '4px',
              border: '1px solid var(--twitch-border)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '14px' }}>🎥 OBS Browser Source URL:</h4>
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'center' 
              }}>
                <input
                  type="text"
                  readOnly
                  value={window.location.href.replace('/config.html', `/obs_overlay.html?channel=${channelId}`)}
                  className="input"
                  style={{ flex: 1, fontSize: '12px' }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  className="button button-secondary"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href.replace('/config.html', `/obs_overlay.html?channel=${channelId}`));
                    alert('URL copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
              <p style={{ 
                fontSize: '11px', 
                color: 'var(--twitch-text-alt)', 
                marginTop: '8px',
                marginBottom: 0 
              }}>
                Add this as a Browser Source in OBS (1920x1080 recommended)
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="button button-secondary" onClick={() => handleViewResults(activeTierList)}>
                View Results
              </button>
              <button className="button button-danger" onClick={() => handleComplete(activeTierList._id)}>
                Complete
              </button>
              <button className="button button-secondary" onClick={() => handleReset(activeTierList._id)}>
                Reset Votes
              </button>
            </div>
          </div>
        )}

        <h2>All Tier Lists</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tierLists.map((tierList) => (
            <div key={tierList._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3>{tierList.title}</h3>
                  <p style={{ color: 'var(--twitch-text-alt)', margin: '5px 0' }}>
                    Status: <span style={{ 
                      color: tierList.status === 'active' ? '#00e5ff' : tierList.status === 'completed' ? '#7fff7f' : '#808080',
                      fontWeight: 'bold'
                    }}>
                      {tierList.status.toUpperCase()}
                    </span>
                  </p>
                  <p style={{ color: 'var(--twitch-text-alt)', margin: '5px 0' }}>
                    {tierList.items.length} items
                  </p>
                  <p style={{ color: 'var(--twitch-text-alt)', margin: '5px 0', fontSize: '12px' }}>
                    Created: {new Date(tierList.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {tierList.status === 'draft' && (
                    <button className="button" onClick={() => handleActivate(tierList._id)}>
                      Activate
                    </button>
                  )}
                  {tierList.status === 'completed' && (
                    <>
                      <button className="button button-secondary" onClick={() => handleViewResults(tierList)}>
                        View Results
                      </button>
                      <button className="button" onClick={() => handleActivate(tierList._id)}>
                        Reactivate
                      </button>
                    </>
                  )}
                  <button 
                    className="button button-danger" 
                    onClick={() => handleDelete(tierList._id)}
                    disabled={tierList._id === activeTierList?._id}
                    title={tierList._id === activeTierList?._id ? 'Cannot delete active tier list' : 'Delete this tier list'}
                    style={{ 
                      opacity: tierList._id === activeTierList?._id ? 0.5 : 1,
                      cursor: tierList._id === activeTierList?._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tierLists.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--twitch-text-alt)', padding: '40px' }}>
            No tier lists yet. Create your first one!
          </p>
        )}
      </div>
      
      {/* Buy Me a Coffee */}
      <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid var(--twitch-border)' }}>
        <a 
          href="https://buymeacoffee.com/matthewforsyth" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'var(--twitch-text-alt)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--twitch-purple)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--twitch-text-alt)'}
        >
          <span style={{ fontSize: '20px' }}>☕</span>
          <span>Support the developer</span>
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
root.render(<Config />);

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { twitchExt } from './utils/twitch';
import { apiClient } from './utils/api';
import { TierListConfig, TierListItem, TierListResults, Suggestion } from './types';
import './styles/global.css';

const Config: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string>('');
  const [tierLists, setTierLists] = useState<TierListConfig[]>([]);
  const [selectedTierList, setSelectedTierList] = useState<TierListConfig | null>(null);
  const [results, setResults] = useState<TierListResults | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmId, setResetConfirmId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; imageUrl?: string } | null>(null);
  const [publishModalId, setPublishModalId] = useState<string | null>(null);
  const [publishDescription, setPublishDescription] = useState('');
  const [publishCategory, setPublishCategory] = useState('');
  const [publishTags, setPublishTags] = useState('');
  const [categories] = useState(['Gaming', 'Movies', 'TV Shows', 'Music', 'Food & Drink', 'Sports', 'Other']);
  
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

  // Load suggestions for active tier list
  useEffect(() => {
    const activeTierList = tierLists.find(tl => tl.status === 'active');
    if (activeTierList) {
      loadSuggestions(activeTierList._id);
    }
  }, [tierLists]);

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
    console.log('[Config] Reset button clicked for tier list:', id);
    setResetConfirmId(id);
  };

  const confirmReset = async () => {
    if (!resetConfirmId) return;
    
    console.log('[Config] Resetting votes for tier list:', resetConfirmId);
    try {
      await apiClient.resetTierListVotes(resetConfirmId);
      if (results?.tierList._id === resetConfirmId) {
        await loadResults(resetConfirmId);
      }
      setError(null);
      setResetConfirmId(null);
    } catch (err: any) {
      console.error('[Config] Reset failed:', err);
      setError(err.message || 'Failed to reset votes');
      setResetConfirmId(null);
    }
  };

  const cancelReset = () => {
    console.log('[Config] Reset cancelled by user');
    setResetConfirmId(null);
  };

  const handleDelete = async (id: string) => {
    console.log('[Config] Delete button clicked for tier list:', id);
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    console.log('[Config] Deleting tier list:', deleteConfirmId);
    try {
      const result = await apiClient.deleteTierList(deleteConfirmId);
      console.log('[Config] Delete successful:', result);
      
      // Close results view if we deleted the currently viewed tier list
      if (selectedTierList?._id === deleteConfirmId) {
        setSelectedTierList(null);
        setResults(null);
      }
      
      // Refresh the tier list
      await loadTierLists();
      setError(null);
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error('[Config] Delete failed:', err);
      console.error('[Config] Error details:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Failed to delete tier list');
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    console.log('[Config] Delete cancelled by user');
    setDeleteConfirmId(null);
  };

  // Item management functions
  const handleAddItemToTierList = async (tierListId: string) => {
    if (!newItemName.trim()) {
      setError('Please provide an item name');
      return;
    }

    try {
      await apiClient.addItemToTierList(tierListId, newItemName.trim(), newItemImage.trim() || undefined);
      setNewItemName('');
      setNewItemImage('');
      await loadTierLists();
      if (selectedTierList?._id === tierListId) {
        await loadResults(tierListId);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    }
  };

  const handleEditItem = (item: TierListItem) => {
    setEditingItem({ id: item.id, name: item.name, imageUrl: item.imageUrl });
  };

  const handleSaveEditedItem = async (tierListId: string) => {
    if (!editingItem || !editingItem.name.trim()) {
      setError('Please provide an item name');
      return;
    }

    try {
      await apiClient.updateTierListItem(
        tierListId,
        editingItem.id,
        editingItem.name.trim(),
        editingItem.imageUrl?.trim() || undefined
      );
      setEditingItem(null);
      await loadTierLists();
      if (selectedTierList?._id === tierListId) {
        await loadResults(tierListId);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (tierListId: string, itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This will also remove all votes for this item.')) {
      return;
    }

    try {
      await apiClient.removeItemFromTierList(tierListId, itemId);
      await loadTierLists();
      if (selectedTierList?._id === tierListId) {
        await loadResults(tierListId);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    }
  };

  const handleAcceptSuggestion = async (suggestion: Suggestion) => {
    try {
      await apiClient.addItemToTierList(suggestion.tierListId, suggestion.itemName, suggestion.imageUrl);
      await apiClient.approveSuggestion(suggestion._id);
      await loadSuggestions(suggestion.tierListId);
      await loadTierLists();
      if (selectedTierList?._id === suggestion.tierListId) {
        await loadResults(suggestion.tierListId);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to accept suggestion');
    }
  };

  const handleRejectSuggestion = async (suggestion: Suggestion) => {
    try {
      await apiClient.rejectSuggestion(suggestion._id);
      await loadSuggestions(suggestion.tierListId);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reject suggestion');
    }
  };

  const loadSuggestions = async (tierListId: string) => {
    try {
      const loadedSuggestions = await apiClient.getSuggestions(tierListId);
      setSuggestions(loadedSuggestions.filter((s: Suggestion) => s.status === 'pending'));
    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
    }
  };

  // Template/Publishing functions
  const handleOpenPublishModal = (tierListId: string) => {
    setPublishModalId(tierListId);
    setPublishDescription('');
    setPublishCategory('');
    setPublishTags('');
  };

  const handlePublish = async () => {
    if (!publishModalId) return;

    try {
      const tagsArray = publishTags.split(',').map(t => t.trim()).filter(t => t);
      await apiClient.publishTierList(publishModalId, {
        description: publishDescription || undefined,
        category: publishCategory || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });
      
      setPublishModalId(null);
      setPublishDescription('');
      setPublishCategory('');
      setPublishTags('');
      await loadTierLists();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to publish template');
    }
  };

  const handleUnpublish = async (tierListId: string) => {
    if (!confirm('Are you sure you want to make this tier list private? It will be removed from the template browser.')) {
      return;
    }

    try {
      await apiClient.unpublishTierList(tierListId);
      await loadTierLists();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to unpublish template');
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
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
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

            {/* Viewer Suggestions */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--twitch-border)' }}>
              <h3>Viewer Suggestions</h3>
              {suggestions.length === 0 ? (
                <p style={{ color: 'var(--twitch-text-alt)', fontSize: '14px' }}>No pending suggestions</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  {suggestions.map((suggestion) => (
                    <div key={suggestion._id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      padding: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px'
                    }}>
                      {suggestion.imageUrl && (
                        <img 
                          src={suggestion.imageUrl} 
                          alt={suggestion.itemName}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{suggestion.itemName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--twitch-text-alt)' }}>
                          Suggested by {suggestion.username}
                        </div>
                      </div>
                      <button 
                        className="button"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        style={{ padding: '5px 15px' }}
                      >
                        Accept
                      </button>
                      <button 
                        className="button button-danger"
                        onClick={() => handleRejectSuggestion(suggestion)}
                        style={{ padding: '5px 15px' }}
                      >
                        Reject
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Management */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--twitch-border)' }}>
              <h3>Manage Items</h3>
              
              {/* Add Item Form */}
              <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px' }}>
                  <input 
                    type="text" 
                    className="input" 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Item name"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItemToTierList(activeTierList._id)}
                  />
                  <input 
                    type="text" 
                    className="input" 
                    value={newItemImage} 
                    onChange={(e) => setNewItemImage(e.target.value)}
                    placeholder="Image URL (optional)"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItemToTierList(activeTierList._id)}
                  />
                  <button 
                    className="button" 
                    onClick={() => handleAddItemToTierList(activeTierList._id)}
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* Item List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {activeTierList.items.map((item) => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px'
                  }}>
                    {editingItem?.id === item.id ? (
                      <>
                        <input 
                          type="text" 
                          className="input" 
                          value={editingItem.name} 
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          style={{ flex: 1, padding: '5px' }}
                        />
                        <input 
                          type="text" 
                          className="input" 
                          value={editingItem.imageUrl || ''} 
                          onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                          placeholder="Image URL"
                          style={{ flex: 2, padding: '5px' }}
                        />
                        <button 
                          className="button"
                          onClick={() => handleSaveEditedItem(activeTierList._id)}
                          style={{ padding: '5px 15px' }}
                        >
                          Save
                        </button>
                        <button 
                          className="button button-secondary"
                          onClick={() => setEditingItem(null)}
                          style={{ padding: '5px 15px' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <span style={{ flex: 1 }}>{item.name}</span>
                        <button 
                          className="button button-secondary"
                          onClick={() => handleEditItem(item)}
                          style={{ padding: '5px 15px' }}
                        >
                          Edit
                        </button>
                        <button 
                          className="button button-danger"
                          onClick={() => handleDeleteItem(activeTierList._id, item.id)}
                          style={{ padding: '5px 15px' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <h2>All Tier Lists</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tierLists.map((tierList) => (
            <div key={tierList._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0 }}>{tierList.title}</h3>
                    {tierList.isPublic && (
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: '#00e5ff',
                        color: '#000',
                        fontWeight: 'bold',
                      }}>
                        🌐 PUBLIC
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--twitch-text-alt)', margin: '5px 0' }}>
                    Status: <span style={{ 
                      color: tierList.status === 'active' ? '#00e5ff' : tierList.status === 'completed' ? '#7fff7f' : '#808080',
                      fontWeight: 'bold'
                    }}>
                      {tierList.status.toUpperCase()}
                    </span>
                  </p>
                  {tierList.description && (
                    <p style={{ color: 'var(--twitch-text-alt)', margin: '5px 0', fontSize: '13px' }}>
                      {tierList.description}
                    </p>
                  )}
                  <p style={{ color: 'var(--twitch-text-alt)', margin: '5px 0' }}>
                    {tierList.items.length} items
                  </p>
                  {tierList.category && (
                    <p style={{ color: 'var(--twitch-text-alt)', margin: '5px 0', fontSize: '12px' }}>
                      Category: {tierList.category}
                    </p>
                  )}
                  {tierList.tags.length > 0 && (
                    <div style={{ margin: '5px 0', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {tierList.tags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
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
                  {tierList.status === 'completed' && !tierList.isPublic && (
                    <button className="button" onClick={() => handleOpenPublishModal(tierList._id)}>
                      📤 Publish
                    </button>
                  )}
                  {tierList.isPublic && (
                    <button className="button button-secondary" onClick={() => handleUnpublish(tierList._id)}>
                      🔒 Unpublish
                    </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '400px',
            margin: '20px',
            padding: '20px'
          }}>
            <h2 style={{ marginTop: 0 }}>Confirm Delete</h2>
            <p>Are you sure you want to delete this tier list? This action cannot be undone and will delete all associated votes.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="button button-danger" onClick={confirmDelete} style={{ flex: 1 }}>
                Delete
              </button>
              <button className="button button-secondary" onClick={cancelDelete} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '400px',
            margin: '20px',
            padding: '20px'
          }}>
            <h2 style={{ marginTop: 0 }}>Confirm Reset</h2>
            <p>Are you sure you want to reset all votes for this tier list? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="button button-danger" onClick={confirmReset} style={{ flex: 1 }}>
                Reset Votes
              </button>
              <button className="button button-secondary" onClick={cancelReset} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Template Modal */}
      {publishModalId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            margin: '20px',
            padding: '20px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>📤 Publish as Template</h2>
            <p style={{ color: 'var(--twitch-text-alt)', marginBottom: '20px' }}>
              Share this tier list with the community. Other streamers can browse, clone, and rate it.
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Title
              </label>
              <input
                type="text"
                value={tierLists.find(tl => tl._id === publishModalId)?.title || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'var(--twitch-text-alt)',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description (Optional)
              </label>
              <textarea
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                placeholder="Describe your tier list... (max 500 characters)"
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'var(--twitch-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--twitch-text)',
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--twitch-text-alt)', marginTop: '4px' }}>
                {publishDescription.length}/500
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Category
              </label>
              <select
                value={publishCategory}
                onChange={(e) => setPublishCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'var(--twitch-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--twitch-text)',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tags (Optional)
              </label>
              <input
                type="text"
                value={publishTags}
                onChange={(e) => setPublishTags(e.target.value)}
                placeholder="e.g., anime, action, 2023 (comma separated)"
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'var(--twitch-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--twitch-text)'
                }}
              />
              <div style={{ fontSize: '12px', color: 'var(--twitch-text-alt)', marginTop: '4px' }}>
                Separate tags with commas. Max 10 tags.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="button" onClick={handlePublish} style={{ flex: 1 }}>
                📤 Publish
              </button>
              <button 
                className="button button-secondary" 
                onClick={() => setPublishModalId(null)} 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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

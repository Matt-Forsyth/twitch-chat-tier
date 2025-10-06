import React, { useEffect, useState } from 'react';
import { apiClient } from './utils/api';
import { Template, TemplatesResponse } from './types';

interface TemplateBrowserProps {
  onClose: () => void;
  onClone?: (tierListId: string) => void;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ onClose, onClone }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'popularity' | 'usage' | 'recent'>('popularity');
  const [categories, setCategories] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [cloning, setCloning] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [voting, setVoting] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Map<string, 'up' | 'down'>>(new Map());

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [search, category, sort]);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getTemplateCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadTemplates = async (loadMore = false) => {
    try {
      console.log('[TemplateBrowser] Loading templates:', { loadMore, search, category, sort });
      setLoading(true);
      const currentSkip = loadMore ? skip : 0;
      
      const data: TemplatesResponse = await apiClient.getTemplates({
        search: search || undefined,
        category: category || undefined,
        sort,
        limit: 12,
        skip: currentSkip,
      });

      console.log('[TemplateBrowser] Loaded templates:', {
        count: data.templates.length,
        total: data.total,
        hasMore: data.hasMore,
        templates: data.templates.map((t: any) => ({ id: t._id, title: t.title, isPublic: t.isPublic, category: t.category }))
      });

      if (loadMore) {
        setTemplates([...templates, ...data.templates]);
      } else {
        setTemplates(data.templates);
        setSkip(0);
      }
      
      setHasMore(data.hasMore);
      setError(null);
    } catch (err: any) {
      console.error('[TemplateBrowser] Load error:', err);
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (template: Template) => {
    try {
      setCloning(template._id);
      const result = await apiClient.cloneTemplate(template._id);
      setError(null);
      
      if (onClone) {
        // Await the onClone callback since it's async
        await onClone(result.tierList._id);
      }
      
      // Only show alert if onClone didn't handle the success message
      if (!onClone) {
        alert(`Template "${template.title}" cloned successfully! Check your tier lists.`);
      }
    } catch (err: any) {
      console.error('[TemplateBrowser] Clone error:', err);
      setError(err.message || 'Failed to clone template');
    } finally {
      setCloning(null);
    }
  };

  const handleVote = async (template: Template, vote: 'up' | 'down') => {
    try {
      setVoting(template._id);
      await apiClient.voteTemplate(template._id, vote);
      
      // Update local state
      setUserVotes(new Map(userVotes.set(template._id, vote)));
      
      // Reload templates to get updated vote counts
      await loadTemplates();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  const handleLoadMore = () => {
    setSkip(skip + 12);
    loadTemplates(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'var(--twitch-background)',
        borderRadius: '8px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--twitch-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0 }}>🎯 Browse Tier List Templates</h2>
          <button
            className="button button-secondary"
            onClick={onClose}
            style={{ padding: '5px 15px' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid var(--twitch-border)',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <input
            type="text"
            className="input"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 300px' }}
          />
          
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ flex: '0 1 150px' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            style={{ flex: '0 1 150px' }}
          >
            <option value="popularity">Most Popular</option>
            <option value="usage">Most Used</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
        }}>
          {error && (
            <div className="error" style={{ marginBottom: '15px' }}>{error}</div>
          )}

          {loading && templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--twitch-text-alt)' }}>
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--twitch-text-alt)' }}>
              No templates found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '15px',
              }}>
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="card"
                    style={{
                      padding: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{template.title}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--twitch-text-alt)' }}>
                      by {template.channelName}
                    </p>

                    {template.description && (
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: 'var(--twitch-text-alt)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {template.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <button
                        onClick={() => handleVote(template, 'up')}
                        disabled={voting === template._id}
                        style={{
                          background: userVotes.get(template._id) === 'up' ? 'var(--twitch-purple)' : 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#fff',
                          fontSize: '14px',
                        }}
                      >
                        👍 {template.upvotes}
                      </button>
                      <button
                        onClick={() => handleVote(template, 'down')}
                        disabled={voting === template._id}
                        style={{
                          background: userVotes.get(template._id) === 'down' ? '#ef5350' : 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#fff',
                          fontSize: '14px',
                        }}
                      >
                        👎 {template.downvotes}
                      </button>
                      <span style={{ color: 'var(--twitch-text-alt)', fontSize: '12px', marginLeft: 'auto' }}>
                        Score: {template.voteScore}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--twitch-text-alt)' }}>
                      <span>📦 {template.items.length} items</span>
                      <span>🔄 {template.usageCount} uses</span>
                    </div>

                    {template.category && (
                      <div style={{ fontSize: '11px' }}>
                        <span style={{
                          backgroundColor: 'var(--twitch-purple)',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}>
                          {template.category}
                        </span>
                      </div>
                    )}

                    {template.tags.length > 0 && (
                      <div style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {template.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                      <button
                        className="button button-secondary"
                        onClick={() => setPreviewTemplate(template)}
                        style={{ flex: 1 }}
                      >
                        👁️ Preview
                      </button>
                      <button
                        className="button"
                        onClick={() => handleClone(template)}
                        disabled={cloning === template._id}
                        style={{ flex: 1 }}
                      >
                        {cloning === template._id ? 'Cloning...' : '📋 Clone'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    className="button button-secondary"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'var(--twitch-background)',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0 }}>{previewTemplate.title}</h2>
              <button
                className="button button-secondary"
                onClick={() => setPreviewTemplate(null)}
                style={{ padding: '5px 15px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--twitch-text-alt)', marginBottom: '15px' }}>
              by {previewTemplate.channelName}
            </p>

            {previewTemplate.description && (
              <p style={{ marginBottom: '15px' }}>{previewTemplate.description}</p>
            )}

            <div style={{ marginBottom: '15px' }}>
              <strong>Tiers:</strong>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                {previewTemplate.tiers.map((tier, i) => (
                  <span key={i} style={{
                    backgroundColor: 'var(--twitch-purple)',
                    padding: '5px 10px',
                    borderRadius: '4px',
                  }}>
                    {tier}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Items ({previewTemplate.items.length}):</strong>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '10px',
                marginTop: '10px',
              }}>
                {previewTemplate.items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '5px',
                        }}
                      />
                    )}
                    <div style={{ fontSize: '13px' }}>{item.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="button"
                onClick={() => {
                  handleClone(previewTemplate);
                  setPreviewTemplate(null);
                }}
                disabled={cloning === previewTemplate._id}
                style={{ flex: 1 }}
              >
                {cloning === previewTemplate._id ? 'Cloning...' : '📋 Clone This Template'}
              </button>
              <button
                className="button button-secondary"
                onClick={() => setPreviewTemplate(null)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBrowser;

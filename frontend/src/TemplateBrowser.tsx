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
  const [sort, setSort] = useState<'rating' | 'usage' | 'recent'>('rating');
  const [categories, setCategories] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [cloning, setCloning] = useState<string | null>(null);

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
      setLoading(true);
      const currentSkip = loadMore ? skip : 0;
      
      const data: TemplatesResponse = await apiClient.getTemplates({
        search: search || undefined,
        category: category || undefined,
        sort,
        limit: 12,
        skip: currentSkip,
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
        onClone(result.tierList._id);
      }
      
      alert(`Template "${template.title}" cloned successfully! Check your tier lists.`);
    } catch (err: any) {
      setError(err.message || 'Failed to clone template');
    } finally {
      setCloning(null);
    }
  };

  const handleLoadMore = () => {
    setSkip(skip + 12);
    loadTemplates(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} style={{ color: '#ffd700' }}>★</span>);
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<span key={i} style={{ color: '#ffd700' }}>⯨</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#666' }}>☆</span>);
      }
    }
    return stars;
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
            <option value="rating">Top Rated</option>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                      {renderStars(template.averageRating)}
                      <span style={{ color: 'var(--twitch-text-alt)', marginLeft: '5px' }}>
                        {template.averageRating > 0 ? template.averageRating.toFixed(1) : 'No ratings'}
                      </span>
                      {template.totalRatings > 0 && (
                        <span style={{ color: 'var(--twitch-text-alt)', fontSize: '12px' }}>
                          ({template.totalRatings})
                        </span>
                      )}
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

                    <button
                      className="button"
                      onClick={() => handleClone(template)}
                      disabled={cloning === template._id}
                      style={{ marginTop: 'auto' }}
                    >
                      {cloning === template._id ? 'Cloning...' : '📋 Clone Template'}
                    </button>
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
    </div>
  );
};

export default TemplateBrowser;

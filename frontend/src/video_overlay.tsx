import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { twitchExt } from './utils/twitch';
import { apiClient } from './utils/api';
import { TierListResults } from './types';
import './styles/global.css';

const VideoOverlay: React.FC = () => {
  const [results, setResults] = useState<TierListResults | null>(null);

  useEffect(() => {
    twitchExt.init();
    
    twitchExt.onAuthorized(async (auth) => {
      apiClient.setToken(auth.token);
      
      try {
        const tierLists = await apiClient.getTierLists();
        const active = tierLists.find((tl: any) => tl.status === 'active');
        
        if (active) {
          const data = await apiClient.getTierListResults(active._id);
          setResults(data);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      }
    });
  }, []);

  if (!results) {
    return null; // Don't show anything if no active tier list
  }

  const groupedResults = results.results.reduce((acc, result) => {
    if (!acc[result.averageTier]) {
      acc[result.averageTier] = [];
    }
    acc[result.averageTier].push(result);
    return acc;
  }, {} as Record<string, typeof results.results>);

  return (
    <div style={{ 
      position: 'absolute', 
      bottom: '20px', 
      right: '20px', 
      maxWidth: '400px',
      background: 'rgba(24, 24, 27, 0.95)',
      border: '2px solid var(--twitch-purple)',
      borderRadius: '8px',
      padding: '15px',
      color: 'white'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{results.tierList.title}</h3>
      <div style={{ fontSize: '12px', marginBottom: '10px', color: '#adadb8' }}>
        {results.totalVoters} voters
      </div>
      
      {results.tierList.tiers.slice(0, 3).map((tier) => {
        const tierResults = groupedResults[tier] || [];
        if (tierResults.length === 0) return null;
        
        return (
          <div key={tier} style={{ marginBottom: '8px' }}>
            <span style={{ 
              display: 'inline-block',
              width: '30px',
              height: '25px',
              lineHeight: '25px',
              textAlign: 'center',
              background: getTierColor(tier),
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '4px',
              marginRight: '8px',
              fontSize: '14px'
            }}>
              {tier}
            </span>
            <span style={{ fontSize: '13px' }}>
              {tierResults.map(r => r.item.name).join(', ')}
            </span>
          </div>
        );
      })}
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
root.render(<VideoOverlay />);

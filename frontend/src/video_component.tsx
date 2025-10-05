import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';

const VideoComponent: React.FC = () => {
  return (
    <div style={{ padding: '10px', color: 'white' }}>
      <div style={{ background: 'rgba(0, 0, 0, 0.7)', padding: '10px', borderRadius: '4px' }}>
        <h3>🎯 Tier List Active!</h3>
        <p style={{ fontSize: '14px' }}>Vote in the panel below</p>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<VideoComponent />);

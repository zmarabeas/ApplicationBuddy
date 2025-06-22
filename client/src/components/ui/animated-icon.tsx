import React from 'react';

interface AnimatedIconProps {
  size?: number;
  className?: string;
}

export default function AnimatedIcon({ size = 60, className = '' }: AnimatedIconProps) {
  const scale = size / 60; // Base size is 60px
  
  return (
    <div 
      className={`animated-search-icon ${className}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        cursor: 'pointer',
        transition: 'transform 0.3s ease'
      }}
    >
      <div 
        className="search-circle"
        style={{
          width: `${40 * scale}px`,
          height: `${40 * scale}px`,
          border: `${4 * scale}px solid #667eea`,
          borderRadius: '50%',
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'all 0.3s ease'
        }}
      />
      <div 
        className="search-handle"
        style={{
          width: `${4 * scale}px`,
          height: `${20 * scale}px`,
          background: '#667eea',
          position: 'absolute',
          top: `${32 * scale}px`,
          left: `${32 * scale}px`,
          borderRadius: `${2 * scale}px`,
          transform: 'rotate(45deg)',
          transition: 'all 0.3s ease'
        }}
      />
      <div 
        className="ai-dot"
        style={{
          width: `${6 * scale}px`,
          height: `${6 * scale}px`,
          background: '#667eea',
          borderRadius: '50%',
          position: 'absolute',
          top: `${17 * scale}px`,
          left: `${17 * scale}px`,
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
} 
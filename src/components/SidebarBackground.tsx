import React from 'react';

interface SidebarBackgroundProps {
  children: React.ReactNode;
}

export const SidebarBackground: React.FC<SidebarBackgroundProps> = ({ children }) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)', // For Safari support
        borderRadius: 'inherit',
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
      }}>
        {children}
      </div>
    </div>
  );
}; 
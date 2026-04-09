import React from 'react';

export const CosmicBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`relative min-h-screen text-white overflow-hidden bg-black ${className}`}>
      {children}
    </div>
  );
};

export default CosmicBackground;

import React from 'react';

export const CosmicBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`relative min-h-screen text-white overflow-x-hidden bg-[#03071E] ${className}`}>
      {/* Dynamic Starfield Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(114,9,183,0.1)_0%,transparent_70%)] animate-pulse" />
        
        {/* Deep Stars */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0))`,
            backgroundSize: '200px 200px',
            animation: 'star-drift 100s linear infinite'
          }}
        />
        
        {/* Medium Stars */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 100px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 200px 50px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 300px 250px, #ddd, rgba(0,0,0,0))`,
            backgroundSize: '400px 400px',
            animation: 'star-drift 60s linear infinite reverse'
          }}
        />

        {/* Floating Nebulas */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cosmic-purple/10 rounded-full blur-[120px] animate-nebula-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cosmic-pink/10 rounded-full blur-[120px] animate-nebula-float-delayed" />
      </div>

      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
};

export default CosmicBackground;

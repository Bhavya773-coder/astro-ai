import React, { useEffect, useRef, memo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
}

interface StarFieldProps {
  starCount?: number;
  className?: string;
}

export const StarField: React.FC<StarFieldProps> = memo(({ starCount = 150, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Update star position (slow parallax movement)
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        // Twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed * 100) * 0.5 + 0.5;
        const currentOpacity = star.opacity * twinkle;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        // Add glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(76, 201, 240, ${currentOpacity * 0.3})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
});

export const NebulaBackground: React.FC<{ className?: string }> = memo(({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 0 }}>
      {/* Nebula gradient 1 - Purple */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(114, 9, 183, 0.6) 0%, rgba(114, 9, 183, 0) 70%)',
          top: '10%',
          left: '-10%',
          filter: 'blur(60px)',
        }}
      />
      {/* Nebula gradient 2 - Pink */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(247, 37, 133, 0.5) 0%, rgba(247, 37, 133, 0) 70%)',
          top: '60%',
          right: '-5%',
          filter: 'blur(80px)',
          animationDelay: '-3s',
        }}
      />
      {/* Nebula gradient 3 - Cyan */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(76, 201, 240, 0.4) 0%, rgba(76, 201, 240, 0) 70%)',
          top: '30%',
          right: '20%',
          filter: 'blur(50px)',
          animationDelay: '-1.5s',
        }}
      />
      {/* Gold glow - bottom left */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0) 70%)',
          bottom: '10%',
          left: '10%',
          filter: 'blur(70px)',
        }}
      />
    </div>
  );
});

export const ParticleField: React.FC<{ count?: number }> = memo(({ count = 30 }) => {
  // Generate stable particle data once on mount
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 10,
      color: i % 3 === 0 ? '#F72585' : i % 3 === 1 ? '#4CC9F0' : '#FFD700',
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: particle.color,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            opacity: 0.6,
            animation: `particle-float ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

export const CosmicBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`relative min-h-screen cosmic-bg ${className}`}>
      <StarField />
      <NebulaBackground />
      <ParticleField />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default CosmicBackground;

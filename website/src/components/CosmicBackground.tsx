import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// --- LAYER 3: Canvas Starfield (Optimized) ---
const StarfieldCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: any[] = [];
    let shootingStars: any[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 8000); // Responsive density
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2,
          alpha: Math.random(),
          speed: Math.random() * 0.015 + 0.005,
          color: Math.random() > 0.8 ? '#fcd34d' : (Math.random() > 0.5 ? '#bfdbfe' : '#ffffff')
        });
      }
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw regular stars
      stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        
        // Add subtle glow to slightly larger stars
        if (star.radius > 1) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = star.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Handle shooting stars
      if (Math.random() < 0.003 && shootingStars.length < 2) {
        // Spawn from top right mostly
        shootingStars.push({
          x: Math.random() * canvas.width * 0.5 + canvas.width * 0.5,
          y: 0,
          length: Math.random() * 80 + 20,
          speed: Math.random() * 10 + 10,
          angle: Math.PI / 4 + Math.random() * 0.2, // Drop down-left
          opacity: 1
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        let ss = shootingStars[i];
        ss.x -= Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0 || ss.x < 0 || ss.y > canvas.height) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
        
        const gradient = ctx.createLinearGradient(
          ss.x, ss.y, 
          ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(drawStars);
    };

    window.addEventListener('resize', resize);
    resize();
    drawStars();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
};

// --- LAYER 4: Subtle Constellations --- 
const ConstellationLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 mix-blend-screen px-10">
      <svg className="absolute w-[600px] h-[600px] top-[10%] left-[5%] rotate-12" viewBox="0 0 100 100">
        <path d="M10,20 L40,30 L60,10 L80,50 L50,80 Z" fill="none" stroke="rgba(196,181,253,0.5)" strokeWidth="0.2" />
        <circle cx="10" cy="20" r="0.5" fill="#fff" />
        <circle cx="40" cy="30" r="0.5" fill="#fff" />
        <circle cx="60" cy="10" r="0.5" fill="#fff" />
        <circle cx="80" cy="50" r="0.5" fill="#fff" />
        <circle cx="50" cy="80" r="0.5" fill="#fff" />
      </svg>
      <svg className="absolute w-[800px] h-[800px] bottom-[5%] right-[-5%] -rotate-12" viewBox="0 0 100 100">
        <path d="M20,90 L40,60 L70,80 L90,40" fill="none" stroke="rgba(252,211,77,0.4)" strokeWidth="0.2" />
        <circle cx="20" cy="90" r="0.5" fill="#fff" />
        <circle cx="40" cy="60" r="0.5" fill="#fff" />
        <circle cx="70" cy="80" r="0.5" fill="#fff" />
        <circle cx="90" cy="40" r="0.5" fill="#fff" />
      </svg>
    </div>
  );
};

export const CosmicBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Throttled mouse position for performance
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 2;
          const y = (e.clientY / window.innerHeight - 0.5) * 2;
          setMousePosition({ x, y });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`relative isolate min-h-screen text-white overflow-hidden ${className}`}>
      
      {/* --- LAYER 0: Base Gradient --- */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#050114] via-[#0F0a2e] to-[#030014] pointer-events-none" style={{ zIndex: -5 }} />
      
      {/* --- LAYER 1: Noise Texture --- */}
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', 
          zIndex: -4 
        }} 
      />

      {/* --- PARALLAX WRAPPER --- */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        animate={{
          x: mousePosition.x * -30,
          y: mousePosition.y * -30
        }}
        transition={{ type: "spring", stiffness: 40, damping: 30 }}
        style={{ zIndex: -3 }}
      >
        {/* --- LAYER 2: Slow Nebulas --- */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-900/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-violet-900/15 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
          transition={{ duration: 80, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] bg-amber-900/5 rounded-full blur-[100px]"
        />

        {/* --- LAYER 4: Constellations --- */}
        <ConstellationLines />
        
        {/* --- LAYER 5: Minimal Zodiac Dust --- */}
        <div className="absolute inset-0 opacity-10">
          <motion.div animate={{ y: [-15, 15, -15], rotate: [0, 45, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute text-xl top-[20%] left-[15%]">☾</motion.div>
          <motion.div animate={{ y: [15, -15, 15], rotate: [0, -45, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }} className="absolute text-xl bottom-[30%] right-[20%]">❖</motion.div>
          <motion.div animate={{ y: [-10, 10, -10], rotate: [0, 15, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute text-sm top-[60%] left-[80%]">✦</motion.div>
        </div>
      </motion.div>

      {/* --- LAYER 3: Starfield (Canvas, Inverse Parallax for depth) --- */}
      <motion.div 
        className="fixed inset-0 pointer-events-none" 
        animate={{
          x: mousePosition.x * -10,
          y: mousePosition.y * -10
        }}
        transition={{ type: "spring", stiffness: 40, damping: 30 }}
        style={{ zIndex: -2 }}
      >
        <StarfieldCanvas />
      </motion.div>

      {/* --- LAYER 6: Readability Vignette Mask --- */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle at 50% 50%, rgba(3, 0, 20, 0.5) 0%, rgba(3, 0, 20, 0.1) 60%, rgba(3, 0, 20, 0.7) 100%)', 
          zIndex: -1 
        }} 
      />

      {/* --- FOREGROUND CONTENT --- */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default CosmicBackground;

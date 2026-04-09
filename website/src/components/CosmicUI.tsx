import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'pink' | 'cyan' | 'gold' | 'purple' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glow = 'pink'
}) => {
  const glowStyles = {
    pink: 'hover:shadow-[0_0_35px_rgba(247,37,133,0.45)]',
    cyan: 'hover:shadow-[0_0_35px_rgba(76,201,240,0.45)]',
    gold: 'hover:shadow-[0_0_35px_rgba(255,215,0,0.45)]',
    purple: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]',
    none: '',
  };

  return (
    <div 
      className={`
        rounded-cosmic 
        border border-white/10
        backdrop-blur-glass
        transition-all duration-500
        group relative overflow-hidden
        ${hover ? `hover:border-cosmic-${glow === 'none' ? 'pink' : glow}/50 ${glowStyles[glow]} hover:-translate-y-2` : ''}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
      }}
    >
      {/* Decorative inner glow for premium feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      
      {children}
    </div>
  );
};

interface CosmicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const CosmicButton: React.FC<CosmicButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-cosmic-purple to-cosmic-pink 
      text-white font-semibold
      hover:scale-105
      shadow-[0_0_10px_rgba(247,37,133,0.4)]
      hover:shadow-[0_0_30px_rgba(114,9,183,0.5),0_0_60px_rgba(247,37,133,0.3)]
    `,
    secondary: `
      bg-transparent border-2 border-cosmic-cyan 
      text-cosmic-cyan font-semibold
      hover:bg-cosmic-cyan/10
      hover:shadow-[0_0_10px_rgba(76,201,240,0.5)]
    `,
    glass: `
      bg-white/10 border border-white/20 
      text-white font-semibold
      backdrop-blur-glass
      hover:bg-white/15
      hover:border-cosmic-pink/50
    `,
    outline: `
      bg-transparent border border-white/30 
      text-white font-semibold
      hover:border-cosmic-pink
      hover:text-cosmic-pink
    `,
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-cosmic
        transition-all duration-300
        relative overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {/* Subtle shimmer effect on primary buttons */}
      {variant === 'primary' && (
        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-[150%] animate-[shimmer_3s_infinite]" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const CosmicInput: React.FC<InputFieldProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/95 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full 
            ${icon ? 'pl-12' : 'px-4'} 
            py-3 
            rounded-cosmic 
            bg-white/5 
            border border-white/20 
            text-white 
            placeholder-white/40 
            transition-all duration-300
            focus:outline-none 
            focus:border-cosmic-pink 
            focus:ring-2 
            focus:ring-cosmic-pink/30
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        className="animate-spin w-full h-full" 
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <span 
      className={`bg-clip-text text-transparent bg-gradient-to-r from-cosmic-cyan via-purple-400 via-cosmic-pink to-cosmic-gold ${className}`}
    >
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string; glow?: boolean }> = ({ 
  children, 
  className = '',
  glow = false
}) => {
  return (
    <h2 
      className={`
        font-display text-3xl md:text-4xl font-bold text-white
        ${glow ? 'text-glow' : ''}
        ${className}
      `}
    >
      {children}
    </h2>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'pink' | 'cyan' | 'gold' | 'purple' }> = ({ 
  children, 
  variant = 'pink' 
}) => {
  const variantColors = {
    pink: 'bg-cosmic-pink/20 text-cosmic-pink border-cosmic-pink/30',
    cyan: 'bg-cosmic-cyan/20 text-cosmic-cyan border-cosmic-cyan/30',
    gold: 'bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30',
    purple: 'bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/30',
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
      ${variantColors[variant]}
    `}>
      {children}
    </span>
  );
};

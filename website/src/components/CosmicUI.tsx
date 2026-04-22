import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'pink' | 'cyan' | 'gold' | 'purple' | 'amber' | 'blue' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glow = 'pink',
  ...props
}) => {
  const glowStyles = {
    pink: 'hover:shadow-[0_0_35px_rgba(247,37,133,0.45)]',
    cyan: 'hover:shadow-[0_0_35px_rgba(76,201,240,0.45)]',
    gold: 'hover:shadow-[0_0_35px_rgba(255,215,0,0.45)]',
    purple: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]',
    amber: 'hover:shadow-[0_0_35px_rgba(245,158,11,0.45)]',
    blue: 'hover:shadow-[0_0_35px_rgba(59,130,246,0.45)]',
    none: '',
  };

  return (
    <div 
      className={`
        rounded-cosmic 
        border border-white/5
        bg-black/40
        backdrop-blur-xl
        transition-all duration-300
        ${hover ? `hover:border-${glow === 'none' ? 'fuchsia-500' : (glow === 'amber' ? 'amber' : (glow === 'blue' ? 'blue' : glow))}-500/50 ${glowStyles[glow]} hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]` : ''}
        ${className}
      `}
      {...props}
    >
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
      bg-gradient-to-r from-violet-600 to-fuchsia-600 
      text-white font-semibold
      hover:scale-105
      shadow-[0_0_15px_rgba(168,85,247,0.4)]
      hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]
    `,
    secondary: `
      bg-transparent border-2 border-violet-500 
      text-violet-400 font-semibold
      hover:bg-violet-500/10
      hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]
    `,
    glass: `
      bg-black/40 border border-white/10 
      text-white font-semibold
      backdrop-blur-xl
      hover:bg-black/60
      hover:border-violet-500/50
      hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]
    `,
    outline: `
      bg-transparent border border-white/20 
      text-white font-semibold
      hover:border-violet-500
      hover:text-violet-400
    `,
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-cosmic
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
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
            bg-black/50 
            border border-white/10 
            text-white 
            placeholder-white/40 
            transition-all duration-300
            focus:outline-none 
            focus:border-fuchsia-500 
            focus:ring-2 
            focus:ring-fuchsia-500/30
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

export const GradientText: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  color?: 'fuchsia' | 'violet' | 'amber' | 'blue' | 'cyan' | 'gold' | 'purple';
}> = ({ 
  children, 
  className = '',
  color = 'fuchsia'
}) => {
  const colorGradients = {
    fuchsia: 'from-fuchsia-400 to-violet-400',
    violet: 'from-violet-400 to-fuchsia-400',
    amber: 'from-amber-400 to-orange-400',
    blue: 'from-blue-400 to-cyan-400',
    cyan: 'from-cyan-400 to-blue-400',
    gold: 'from-yellow-300 to-amber-500',
    purple: 'from-purple-400 to-indigo-400',
  };

  return (
    <span 
      className={`bg-clip-text text-transparent bg-gradient-to-r ${colorGradients[color]} drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] ${className}`}
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
    pink: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
    cyan: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    gold: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    purple: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
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

export const Skeleton: React.FC<{
  className?: string;
  variant?: 'rect' | 'text' | 'circle';
}> = ({ className = '', variant = 'rect' }) => {
  const variantClasses = {
    rect: 'rounded-lg',
    text: 'rounded h-4 w-full',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`
        animate-pulse bg-white/5 border border-white/5
        ${variantClasses[variant]}
        ${className}
      `}
    />
  );
};

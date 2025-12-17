import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'neon';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'glass',
}) => {
  const variants = {
    default: 'bg-zinc-900 border border-white/10 shadow-xl',
    glass: 'glass-panel shadow-2xl',
    neon: 'bg-black/40 border border-violet-500/30 shadow-[0_0_30px_rgba(124,58,237,0.1)]',
  };

  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';

  const clickableStyles = onClick
    ? 'cursor-pointer hover:scale-[1.01] hover:shadow-violet-900/20 hover:border-white/20'
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

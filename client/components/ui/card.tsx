import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  const baseStyles =
    'bg-white rounded-lg shadow-md p-6 border border-gray-200';
  const clickableStyles = onClick
    ? 'cursor-pointer hover:shadow-lg transition-shadow'
    : '';

  return (
    <div
      className={`${baseStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const baseStyles = 'rounded-lg overflow-hidden backdrop-blur-sm';
  
  const variantStyles = {
    default: 'bg-[#25252d]/90 glow-border hover:bg-[#25252d]',
    elevated: 'bg-[#25252d]/90 shadow-lg shadow-black/30 glow-border hover:bg-[#25252d]',
    bordered: 'bg-[#25252d]/90 glow-border hover:bg-[#25252d]'
  };

  const allStyles = `${baseStyles} ${variantStyles[variant]} ${className} ${onClick ? 'cursor-pointer' : ''} transition-all duration-300`;

  return (
    <div 
      className={allStyles} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
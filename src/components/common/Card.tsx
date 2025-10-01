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
    default: 'bg-[#15120c]/90 glow-border hover:bg-[#15120c]',
    elevated: 'bg-[#15120c]/90 shadow-lg shadow-black/30 glow-border hover:bg-[#15120c]',
    bordered: 'bg-[#15120c]/90 glow-border hover:bg-[#15120c]'
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
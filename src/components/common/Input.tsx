import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, icon, className = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block mb-1 text-sm font-medium text-[#e2e8f0]"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              bg-[#25252d]/90
              border 
              ${error ? 'border-red-500' : 'glow-border'} 
              text-[#e2e8f0] 
              rounded-md 
              shadow-sm
              w-full 
              py-2 
              px-4 
              ${icon ? 'pl-10' : ''} 
              focus:outline-none 
              focus:ring-1 
              focus:ring-[#94a3b8]/50
              focus:border-[#94a3b8]/50
              hover:bg-[#25252d]
              transition-all duration-300
              ${className}
            `}
            {...props}
          />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
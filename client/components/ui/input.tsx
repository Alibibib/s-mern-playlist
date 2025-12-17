import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`w-full px-4 py-3 bg-black/20 border rounded-xl outline-none transition-all duration-300 text-white placeholder-gray-500
            ${error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
              : 'border-white/10 hover:border-white/20 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:bg-black/40'
            } ${className}`}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10 blur-md" />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 ml-1">{error}</p>
      )}
    </div>
  );
};

import React, { useState } from 'react';

export default function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  placeholder = 'Your password',
  required = true,
  autoComplete = 'current-password',
  disabled = false,
  className = '',
  hasError = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`h-12 w-full rounded-xl bg-[#FFFFFF] dark:bg-[#0D0D10] border ${
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
            : 'border-[#DCDCE6] dark:border-[#26262E] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] focus:border-[#6D5AE6] dark:focus:border-[#8B7CF6] focus:ring-4 focus:ring-[rgba(109,90,230,0.15)] dark:focus:ring-[rgba(139,124,246,0.2)]'
        } text-[#14142B] dark:text-[#FFFFFF] placeholder-[#8B8BA3] dark:placeholder-[#5A5A5A] px-4 pr-11 text-sm outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8B8BA3] dark:text-[#8A8A8A] hover:text-[#14142B] dark:hover:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#6D5AE6]/25 dark:focus:ring-[#8B7CF6]/30 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {showPassword ? (
          // Eye-off icon
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        ) : (
          // Eye icon
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

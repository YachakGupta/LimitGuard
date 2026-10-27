import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectThemeMode } from '../features/theme/themeSlice';

export default function ThemeToggle({ className = '' }) {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
      className={`w-10 h-10 flex items-center justify-center rounded-xl border border-[#E7E7EF] dark:border-[#26262E] bg-[#FFFFFF] dark:bg-[#111114] text-[#3B3B55] dark:text-[#E0E0EC] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6D5AE6]/25 dark:focus:ring-[#8B7CF6]/30 focus:ring-offset-1 dark:focus:ring-offset-[#111114] ${className}`}
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {mode === 'dark' ? (
          // Sun icon in dark mode
          <svg
            className="w-5 h-5 text-amber-400 transform rotate-0 scale-100 transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          // Moon icon in light mode (#3B3B55)
          <svg
            className="w-5 h-5 text-[#3B3B55] transform rotate-0 scale-100 transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </div>
    </button>
  );
}

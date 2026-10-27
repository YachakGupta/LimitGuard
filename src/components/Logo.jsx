import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ className = '', linked = true }) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors duration-200">
        <svg
          className="w-5 h-5 text-[#8B7CF6]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#FFFFFF] transition-colors duration-200">
        Limit<span className="text-[#8B7CF6]">Guard</span>
      </span>
    </div>
  );

  if (linked) {
    return (
      <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-[#8B7CF6] rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}

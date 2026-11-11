import React from 'react';

/**
 * Official SVG brand logos for all competitive coding & developer platforms.
 */
export default function PlatformLogo({ platform, className = 'w-5 h-5', size = 20 }) {
  const key = (platform || '').toLowerCase().replace(/[\s\-_]/g, '');

  switch (key) {
    case 'leetcode':
    case 'lc':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.728-1.78.728s-1.314-.261-1.8-.748L4.94 15.632A6.67 6.67 0 013 10.874c0-1.82.72-3.528 2.01-4.797l4.89-4.792c.465-.466 1.11-.727 1.78-.727.67 0 1.314.261 1.78.727l2.642 2.607a1.23 1.23 0 010 1.74 1.23 1.23 0 01-1.74 0L11.68 2.99a.88.88 0 00-.6-.24.88.88 0 00-.6.24L5.61 7.782C4.54 8.83 3.96 10.22 3.96 11.7c0 1.48.58 2.87 1.65 3.918l4.885 4.885c.34.34.78.51 1.22.51s.88-.17 1.22-.51l2.697-2.607a1.23 1.23 0 011.74 0 1.23 1.23 0 010 1.74z"
            fill="#FFA116"
          />
          <path
            d="M9.86 12.83l7.98-7.98c.48-.48 1.26-.48 1.74 0s.48 1.26 0 1.74l-7.98 7.98c-.48.48-1.26.48-1.74 0s-.48-1.26 0-1.74z"
            fill="#FFFFFF"
          />
          <path
            d="M14.05 13.92h6.72c.68 0 1.23.55 1.23 1.23s-.55 1.23-1.23 1.23h-6.72c-.68 0-1.23-.55-1.23-1.23s.55-1.23 1.23-1.23z"
            fill="#B3B3B3"
          />
        </svg>
      );

    case 'codeforces':
    case 'cf':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Yellow Bar (Left) */}
          <rect x="2" y="10.5" width="4.5" height="11.5" rx="1.5" fill="#FFD400" />
          {/* Blue Bar (Middle) */}
          <rect x="9.5" y="4" width="4.5" height="18" rx="1.5" fill="#216FFF" />
          {/* Red Bar (Right) */}
          <rect x="17" y="7.5" width="4.5" height="14.5" rx="1.5" fill="#E62129" />
        </svg>
      );

    case 'gfg':
    case 'geeksforgeeks':
    case 'geeksforgeek':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* GeeksforGeeks double curved G */}
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93c-2.88.35-5.35-1.76-5.49-4.57-.14-2.82 2.05-5.18 4.88-5.26 1.43-.04 2.76.51 3.73 1.43l-1.39 1.39c-.64-.61-1.5-1-2.42-.98-1.77.05-3.14 1.54-3.05 3.31.09 1.77 1.63 3.09 3.4 2.87 1.25-.15 2.19-.99 2.5-2.12H12.5v-2h5.05c.08.33.12.67.12 1.03 0 2.71-1.92 4.98-4.67 4.9z"
            fill="#2F8D46"
          />
        </svg>
      );

    case 'codechef':
    case 'cc':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* CodeChef Hat & Spoon */}
          <path
            d="M19 10c0-1.66-1.34-3-3-3-.26 0-.5.04-.74.1A4.98 4.98 0 007.74 7.1C7.5 7.04 7.26 7 7 7 5.34 7 4 8.34 4 10c0 1.28.81 2.37 1.95 2.79L5.5 17c0 .55.45 1 1 1h11c.55 0 1-.45 1-1l-.45-4.21A3.003 3.003 0 0019 10z"
            fill="#8B572A"
          />
          <path
            d="M8 19h8v2H8z"
            fill="#D0884A"
          />
        </svg>
      );

    case 'hackerrank':
    case 'hr':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* HackerRank Hexagon & H */}
          <path
            d="M12 2L3 7.2v9.6L12 22l9-5.2V7.2L12 2z"
            fill="#00EA64"
          />
          <path
            d="M9 7.5v9h2.2v-3.4h1.6v3.4H15v-9h-2.2v3.4h-1.6V7.5H9z"
            fill="#091428"
          />
        </svg>
      );

    case 'atcoder':
    case 'ac':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* AtCoder target icon */}
          <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="2" fill="none" />
          <path
            d="M12 6v12M6 12h12"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
        </svg>
      );

    case 'github':
    case 'gh':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`shrink-0 ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
  }
}


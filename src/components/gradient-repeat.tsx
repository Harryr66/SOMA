import * as React from 'react';

export function GradientRepeat({ className }: { className?: string }) {
  const id = React.useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#51C4D3" />
          <stop offset="10%" stopColor="#77ACF1" />
          <stop offset="20%" stopColor="#EF88AD" />
          <stop offset="30%" stopColor="#A53860" />
          <stop offset="40%" stopColor="#670D2F" />
          <stop offset="50%" stopColor="#E8988A" />
          <stop offset="60%" stopColor="#FFEAD8" />
          <stop offset="70%" stopColor="#BA487F" />
          <stop offset="80%" stopColor="#E1ACAC" />
          <stop offset="90%" stopColor="#51C4D3" />
          <stop offset="100%" stopColor="#77ACF1" />
        </linearGradient>
      </defs>
      <path d="M17 2.1l4 4-4 4" />
      <path d="M3 12.6V8c0-3.3 2.7-6 6-6h12" />
      <path d="m7 21.9-4-4 4-4" />
      <path d="M21 11.4V16c0 3.3-2.7 6-6 6H3" />
    </svg>
  );
}

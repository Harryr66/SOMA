import * as React from 'react';

export function GradientHeart({
  className,
  variant = 'filled',
}: {
  className?: string;
  variant?: 'filled' | 'outline';
}) {
  const id = React.useId();
  const svgProps =
    variant === 'filled'
      ? { fill: `url(#${id})` }
      : {
          fill: 'none',
          stroke: `url(#${id})`,
          strokeWidth: '2',
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...svgProps}
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

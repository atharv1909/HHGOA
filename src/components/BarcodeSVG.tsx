'use client';

import React from 'react';

interface BarcodeSVGProps {
  value: string;
  color?: string;
  height?: number | string;
  width?: number | string;
}

export default function BarcodeSVG({
  value,
  color = '#012119',
  height = '100%',
  width = '100%',
}: BarcodeSVGProps) {
  // Generate deterministic bar pattern from input value
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  const numBars = 55;
  const bars: { x: number; width: number }[] = [];
  const barUnit = 100 / numBars;

  for (let i = 0; i < numBars; i++) {
    const bit = (hash >> (i % 31)) & 1;
    const isThin = i % 2 === 0 || bit === 1;

    if (isThin || i === 0 || i === numBars - 1) {
      const w = barUnit * (isThin ? 0.75 : 0.45);
      bars.push({ x: i * barUnit, width: w });
    }
  }

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      style={{ width, height, display: 'block' }}
    >
      <g fill={color}>
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={`${bar.x}%`}
            y="0"
            width={`${bar.width}%`}
            height="100%"
            rx="0.5"
          />
        ))}
      </g>
    </svg>
  );
}

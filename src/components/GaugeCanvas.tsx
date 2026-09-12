import React, { memo, useId } from 'react';

interface GaugeCanvasProps {
  percentage: number;
  isDraining?: boolean;
}

const FIXED_TOP_GRAINS = [
  [-0.76, -2, 2.2], [-0.61, 2, 1.5], [-0.44, -1, 1.8], [-0.28, 3, 1.3],
  [-0.09, 1, 1.7], [0.12, 3, 1.2], [0.31, -1, 1.8], [0.49, 2, 1.4],
  [0.65, 0, 1.9], [0.8, 3, 1.2]
] as const;

const FIXED_MOUND_GRAINS = [
  [-62, 19, 1.5], [-48, 12, 1.9], [-33, 8, 1.2], [-20, 4, 1.7],
  [-7, 1, 1.3], [9, 3, 1.8], [24, 7, 1.2], [39, 11, 1.7], [55, 17, 1.3]
] as const;

function GaugeCanvasComponent({ percentage, isDraining = false }: GaugeCanvasProps) {
  const id = useId().replace(/:/g, '');
  const rawPercentage = Math.max(0, Math.min(100, percentage));
  const displayPercentage = Math.round(rawPercentage * 10) / 10;
  const remaining = rawPercentage / 100;
  const elapsed = 1 - remaining;

  const centerX = 160;
  const topY = 35 + elapsed * 92;
  const topHalfWidth = Math.max(7, 84 * Math.pow(remaining, 0.72));
  const topDepth = Math.max(10, 139 - topY);
  const moundTopY = 247 - elapsed * 76;
  const fallDistance = Math.max(8, moundTopY - 142);

  const topPath = `
    M ${centerX - topHalfWidth} ${topY}
    C ${centerX - topHalfWidth * 0.7} ${topY - 3}, ${centerX - topHalfWidth * 0.28} ${topY + 5}, ${centerX} ${topY + 3}
    C ${centerX + topHalfWidth * 0.24} ${topY + 6}, ${centerX + topHalfWidth * 0.66} ${topY - 2}, ${centerX + topHalfWidth} ${topY + 1}
    C ${centerX + topHalfWidth + 2} ${topY + topDepth * 0.14}, ${centerX + topHalfWidth * 0.94} ${topY + topDepth * 0.29}, ${centerX + topHalfWidth * 0.82} ${topY + topDepth * 0.4}
    C ${centerX + topHalfWidth * 0.7} ${topY + topDepth * 0.51}, ${centerX + topHalfWidth * 0.58} ${topY + topDepth * 0.63}, ${centerX + topHalfWidth * 0.42} ${topY + topDepth * 0.72}
    C ${centerX + topHalfWidth * 0.29} ${topY + topDepth * 0.82}, ${centerX + 14} ${topY + topDepth * 0.92}, ${centerX + 7} 139
    Q ${centerX} 146 ${centerX - 7} 139
    C ${centerX - 15} ${topY + topDepth * 0.91}, ${centerX - topHalfWidth * 0.3} ${topY + topDepth * 0.82}, ${centerX - topHalfWidth * 0.44} ${topY + topDepth * 0.72}
    C ${centerX - topHalfWidth * 0.61} ${topY + topDepth * 0.61}, ${centerX - topHalfWidth * 0.71} ${topY + topDepth * 0.48}, ${centerX - topHalfWidth * 0.84} ${topY + topDepth * 0.37}
    C ${centerX - topHalfWidth * 0.95} ${topY + topDepth * 0.25}, ${centerX - topHalfWidth - 2} ${topY + topDepth * 0.12}, ${centerX - topHalfWidth} ${topY}
    Z`;

  const moundPath = `
    M 77 252
    C 92 246, 105 ${moundTopY + 25}, 127 ${moundTopY + 12}
    C 141 ${moundTopY + 4}, 150 ${moundTopY + 1}, 160 ${moundTopY}
    C 174 ${moundTopY + 1}, 185 ${moundTopY + 8}, 197 ${moundTopY + 14}
    C 218 ${moundTopY + 25}, 230 245, 243 252
    C 205 263, 117 264, 77 252 Z`;

  const fallStyle = { '--fall-distance': `${fallDistance}px` } as React.CSSProperties;

  return (
    <div className="sand-sculpture" aria-label={`残り時間 ${Math.round(displayPercentage)}パーセント`}>
      <svg className="sand-sculpture-art" viewBox="0 0 320 280" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#e3c187" />
            <stop offset="0.52" stopColor="#c99b5a" />
            <stop offset="1" stopColor="#9f703d" />
          </linearGradient>
          <pattern id={`${id}-texture`} width="17" height="17" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="4" r="1.1" fill="#fff7e7" opacity=".48" />
            <circle cx="12" cy="7" r=".8" fill="#76502b" opacity=".25" />
            <circle cx="7" cy="14" r=".7" fill="#fff" opacity=".35" />
          </pattern>
          <filter id={`${id}-soft-shadow`} x="-25%" y="-25%" width="150%" height="170%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#76522e" floodOpacity=".14" />
          </filter>
        </defs>

        <ellipse className="sand-ground-shadow" cx="160" cy="263" rx="82" ry="9" />

        <g filter={`url(#${id}-soft-shadow)`}>
          {rawPercentage > 0 && (
            <g>
              <path d={topPath} fill={`url(#${id}-sand)`} />
              <path d={topPath} fill={`url(#${id}-texture)`} opacity=".62" />
              <g className="surface-grains" fill="#9f703d">
                {FIXED_TOP_GRAINS.map(([offset, y, radius], index) => (
                  <circle
                    key={index}
                    cx={centerX + offset * topHalfWidth}
                    cy={topY + y}
                    r={radius}
                    opacity={0.34 + (index % 3) * 0.12}
                  />
                ))}
              </g>
            </g>
          )}

          {elapsed > 0.0001 && (
            <g>
              <path d={moundPath} fill={`url(#${id}-sand)`} />
              <path d={moundPath} fill={`url(#${id}-texture)`} opacity=".55" />
              <g fill="#f5dfba">
                {FIXED_MOUND_GRAINS.map(([x, y, radius], index) => (
                  <circle key={index} cx={centerX + x} cy={moundTopY + y} r={radius} opacity=".56" />
                ))}
              </g>
            </g>
          )}
        </g>

        {isDraining && rawPercentage > 0 && elapsed > 0.0001 && (
          <g className="sand-flow" style={fallStyle}>
            <line
              className="sand-stream"
              x1="160"
              y1="141"
              x2="160"
              y2={moundTopY + 2}
              stroke="#bd8d50"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="1.5 4"
            />
            <g fill="#c99b5a">
              <circle className="falling-grain grain-a" cx="155" cy="144" r="1.7" />
              <circle className="falling-grain grain-b" cx="163" cy="143" r="1.2" />
              <circle className="falling-grain grain-c" cx="158" cy="146" r="1.4" />
              <circle className="falling-grain grain-d" cx="162" cy="145" r="1" />
            </g>
            <g className="landing-grains" fill="#9f703d">
              <circle className="landing-grain landing-a" cx="158" cy={moundTopY + 2} r="1.5" />
              <circle className="landing-grain landing-b" cx="162" cy={moundTopY + 3} r="1.2" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export const GaugeCanvas = memo(GaugeCanvasComponent, (previous, next) => (
  Math.round(previous.percentage * 10) === Math.round(next.percentage * 10)
  && previous.isDraining === next.isDraining
));

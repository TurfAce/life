import React, { useId } from 'react';

interface GaugeCanvasProps {
  percentage: number;
  isDraining?: boolean;
  scope?: 'life' | 'day';
}

/**
 * A frame-less hourglass: only the floating contents are visible.
 * It is intentionally static so frequent timer updates never cause flashing.
 */
export const GaugeCanvas: React.FC<GaugeCanvasProps> = ({
  percentage,
  isDraining = false,
  scope = 'life'
}) => {
  const gradientId = useId().replace(/:/g, '');
  const shadowId = useId().replace(/:/g, '');
  // Updating the shape only at visible 0.1% steps prevents needless repaints.
  const clamped = Math.round(Math.max(0, Math.min(100, percentage)) * 10) / 10;
  const remaining = clamped / 100;
  const elapsed = 1 - remaining;

  // The upper contents shrink down toward the neck.
  const topSurfaceY = 42 + elapsed * 96;
  const topHalfWidth = 76 * remaining + 3;

  // Used time gathers as a soft mound in the lower chamber.
  const moundTopY = 274 - elapsed * 98;
  const moundShoulderY = moundTopY + 27;
  const colorA = scope === 'life' ? '#75a899' : '#d5a965';
  const colorB = scope === 'life' ? '#477c70' : '#b9813f';
  const label = scope === 'life' ? '人生の残り' : '今日の残り';

  return (
    <div className={`sand-gauge sand-gauge-${scope}`} aria-label={`${label} ${clamped.toFixed(1)}パーセント`}>
      <svg className="sand-gauge-art" viewBox="0 0 300 330" role="img" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colorA} />
            <stop offset="1" stopColor={colorB} />
          </linearGradient>
          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor={colorB} floodOpacity="0.18" />
          </filter>
        </defs>

        <ellipse cx="150" cy="300" rx="78" ry="11" fill={colorB} opacity="0.09" />

        <g fill={`url(#${gradientId})`} filter={`url(#${shadowId})`}>
          {remaining > 0.005 && (
            <path
              d={`M ${150 - topHalfWidth} ${topSurfaceY}
                  Q 150 ${topSurfaceY - 8} ${150 + topHalfWidth} ${topSurfaceY}
                  C ${207 - elapsed * 49} ${topSurfaceY + 26}, 171 132, 156 148
                  Q 150 154 144 148
                  C 129 132, ${93 + elapsed * 49} ${topSurfaceY + 26}, ${150 - topHalfWidth} ${topSurfaceY} Z`}
            />
          )}

          {elapsed > 0.005 && (
            <path
              d={`M 69 279
                  Q 150 294 231 279
                  C 220 258, 199 ${moundShoulderY}, 169 ${moundTopY + 7}
                  Q 150 ${moundTopY - 7} 131 ${moundTopY + 7}
                  C 101 ${moundShoulderY}, 80 258, 69 279 Z`}
            />
          )}
        </g>

        {isDraining && remaining > 0.005 && elapsed > 0.005 && (
          <g className="sand-flow" color={colorB}>
            <line
              className="sand-stream"
              x1="150"
              y1="148"
              x2="150"
              y2={Math.max(156, moundTopY + 3)}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 5"
            />
            <g fill="currentColor">
              <circle className="sand-grain sand-grain-1" cx="144" cy="153" r="2.1" />
              <circle className="sand-grain sand-grain-2" cx="156" cy="156" r="1.6" />
              <circle className="sand-grain sand-grain-3" cx="147" cy="160" r="1.3" />
              <circle className="sand-grain sand-grain-4" cx="153" cy="151" r="1.8" />
            </g>
          </g>
        )}
      </svg>

      <div className="sand-gauge-value">{clamped.toFixed(1)}%</div>
      <div className="sand-gauge-label">{label}</div>
      <div className="sand-gauge-note">
        {scope === 'life'
          ? '上が残された時間、下が歩んできた時間です'
          : '0時から24時までの、今日という一日です'}
      </div>
    </div>
  );
};

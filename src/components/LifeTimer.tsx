import React from 'react';
import type { RemainingTimeDetails } from '../utils/lifeCalc';
import { formatMsToReadable } from '../utils/lifeCalc';
import { ShieldCheck, Flame } from 'lucide-react';

interface LifeTimerProps {
  details: RemainingTimeDetails;
  isScreenActive: boolean;
}

export const LifeTimer: React.FC<LifeTimerProps> = ({ details, isScreenActive }) => {
  const padZero = (num: number, length: number = 2) => {
    return String(num).padStart(length, '0');
  };

  return (
    <div className="glass-panel timer-hero-card glass-panel-glow">
      <div className="hero-status">
        {isScreenActive ? (
          <span className="status-pill off">
            <Flame size={14} /> 画面を見ている時間
          </span>
        ) : (
          <span className="status-pill">
            <ShieldCheck size={14} /> 自分の時間を守っています
          </span>
        )}
      </div>

      <div className="hero-subtitle">あなたに残された時間</div>

      {/* Hero Digits with 1st decimal place for seconds (.X) */}
      <div className="hero-timer-digits">
        {details.years}y {padZero(details.days, 3)}d {padZero(details.hours)}:{padZero(details.minutes)}:{padZero(details.seconds)}
        <span className="decisecond">
          .{details.decisecond}s
        </span>
      </div>

      {/* Screen On / Off Impact Metrics */}
      <div className="impact-metrics">
        <div className="impact-chip impact-chip-used">
          <span>画面を見ていた時間</span>
          <strong>
            -{formatMsToReadable(details.screenOnDeductedMs)}
          </strong>
        </div>

        <div className="impact-chip impact-chip-saved">
          <span>画面を離れた時間</span>
          <strong>
            +{formatMsToReadable(details.preservedLifeMs)}
          </strong>
        </div>
      </div>

      {/* Grid Breakdown */}
      <div className="time-breakdown-grid">
        <div className="time-unit-box">
          <div className="time-unit-val">{details.years}</div>
          <div className="time-unit-lbl">年</div>
        </div>
        <div className="time-unit-box">
          <div className="time-unit-val">{padZero(details.days, 3)}</div>
          <div className="time-unit-lbl">日</div>
        </div>
        <div className="time-unit-box">
          <div className="time-unit-val">{padZero(details.hours)}:{padZero(details.minutes)}</div>
          <div className="time-unit-lbl">時・分</div>
        </div>
        <div className="time-unit-box">
          <div className="time-unit-val">{padZero(details.seconds)}.{details.decisecond}</div>
          <div className="time-unit-lbl">秒</div>
        </div>
      </div>
    </div>
  );
};

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {isScreenActive ? (
          <span className="status-pill off" style={{ fontSize: '0.75rem' }}>
            <Flame size={14} /> 画面点灯中: 人生時間を消費中 (マイナスカウント)
          </span>
        ) : (
          <span className="status-pill" style={{ fontSize: '0.75rem' }}>
            <ShieldCheck size={14} /> 画面消灯中: 人生時間を保護中 (プラス還元)
          </span>
        )}
      </div>

      <div className="hero-subtitle">REMAINING LIFESPAN (残り人生時間)</div>

      {/* Hero Digits with 1st decimal place for seconds (.X) */}
      <div className="hero-timer-digits">
        {details.years}y {padZero(details.days, 3)}d {padZero(details.hours)}:{padZero(details.minutes)}:{padZero(details.seconds)}
        <span style={{ fontSize: '0.65em', color: 'var(--accent-crimson)', marginLeft: '0.05em' }}>
          .{details.decisecond}s
        </span>
      </div>

      {/* Screen On / Off Impact Metrics */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(255, 42, 85, 0.1)', border: '1px solid rgba(255, 42, 85, 0.25)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>画面点灯による消費: </span>
          <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-crimson)', marginLeft: '0.25rem' }}>
            -{formatMsToReadable(details.screenOnDeductedMs)}
          </strong>
        </div>

        <div style={{ background: 'rgba(0, 255, 170, 0.1)', border: '1px solid rgba(0, 255, 170, 0.25)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>画面消灯による保護: </span>
          <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginLeft: '0.25rem' }}>
            +{formatMsToReadable(details.preservedLifeMs)}
          </strong>
        </div>
      </div>

      {/* Grid Breakdown */}
      <div className="time-breakdown-grid" style={{ marginTop: '1rem' }}>
        <div className="time-unit-box">
          <div className="time-unit-val">{details.years}</div>
          <div className="time-unit-lbl">Years (年)</div>
        </div>
        <div className="time-unit-box">
          <div className="time-unit-val">{padZero(details.days, 3)}</div>
          <div className="time-unit-lbl">Days (日)</div>
        </div>
        <div className="time-unit-box">
          <div className="time-unit-val">{padZero(details.hours)}:{padZero(details.minutes)}</div>
          <div className="time-unit-lbl">Hours/Mins</div>
        </div>
        <div className="time-unit-box">
          <div className="time-unit-val">{padZero(details.seconds)}.{details.decisecond}</div>
          <div className="time-unit-lbl">Secs (秒.小数点第1位)</div>
        </div>
      </div>
    </div>
  );
};

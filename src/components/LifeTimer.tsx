import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { RemainingTimeDetails } from '../utils/lifeCalc';
import { GaugeCanvas } from './GaugeCanvas';

export type TimeScope = 'day' | 'life';

interface LifeTimerProps {
  scope: TimeScope;
  details: RemainingTimeDetails;
  dailyRemainingMs: number;
  dailyTotalMs: number;
  percentage: number;
  isScreenActive: boolean;
  onScopeChange: (scope: TimeScope) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365.25 * DAY_MS;

function formatToday(ms: number) {
  if (ms < 60_000) return '1分未満';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
}

function formatLife(ms: number) {
  if (ms >= YEAR_MS) return `約${Math.floor(ms / YEAR_MS)}年`;
  if (ms >= DAY_MS) return `${Math.floor(ms / DAY_MS)}日`;
  if (ms >= 60 * 60 * 1000) return `${Math.floor(ms / (60 * 60 * 1000))}時間`;
  return '1時間未満';
}

export const LifeTimer: React.FC<LifeTimerProps> = ({
  scope,
  details,
  dailyRemainingMs,
  dailyTotalMs,
  percentage,
  isScreenActive,
  onScopeChange
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isDay = scope === 'day';
  const remainingMs = isDay ? dailyRemainingMs : details.remainingMs;
  const roundedPercentage = Math.max(0, Math.min(100, Math.round(percentage)));

  const dayRemainingMinutes = Math.max(0, Math.floor(dailyRemainingMs / 60_000));
  const dayElapsedMinutes = Math.max(0, Math.floor((dailyTotalMs - dailyRemainingMs) / 60_000));
  const dayHours = Math.floor(dayRemainingMinutes / 60);
  const dayMinutes = dayRemainingMinutes % 60;

  return (
    <section className="focus-panel" aria-labelledby="remaining-time-title">
      <div className="scope-switch" role="tablist" aria-label="表示する時間">
        <button
          type="button"
          role="tab"
          aria-selected={isDay}
          className={isDay ? 'is-selected' : ''}
          onClick={() => onScopeChange('day')}
        >
          今日
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isDay}
          className={!isDay ? 'is-selected' : ''}
          onClick={() => onScopeChange('life')}
        >
          一生
        </button>
      </div>

      <p className="remaining-kicker" id="remaining-time-title">
        {isDay ? '今日の残り時間' : '一生の残り時間'}
      </p>
      <div className="remaining-primary" aria-live="polite">
        {isDay ? formatToday(remainingMs) : formatLife(remainingMs)}
      </div>

      <GaugeCanvas percentage={percentage} isDraining={isScreenActive} />

      <p className="remaining-percentage">残り {roundedPercentage}%</p>
      <button
        type="button"
        className="detail-toggle"
        aria-expanded={isDetailOpen}
        aria-controls="time-detail"
        onClick={() => setIsDetailOpen((open) => !open)}
      >
        時間の詳細
        <ChevronDown size={16} className={isDetailOpen ? 'is-open' : ''} />
      </button>

      <div id="time-detail" className={`time-detail ${isDetailOpen ? 'is-open' : ''}`} hidden={!isDetailOpen}>
        {isDay ? (
          <dl>
            <div><dt>残り</dt><dd>{dayHours}時間 {dayMinutes}分</dd></div>
            <div><dt>経過</dt><dd>{Math.floor(dayElapsedMinutes / 60)}時間 {dayElapsedMinutes % 60}分</dd></div>
          </dl>
        ) : (
          <dl>
            <div><dt>残り</dt><dd>{details.years}年 {details.days}日 {details.hours}時間 {details.minutes}分</dd></div>
            <div><dt>想定期間に対する残り</dt><dd>{roundedPercentage}%</dd></div>
          </dl>
        )}
      </div>

      <p className="scope-note">
        {isDay ? '今日の24時までの時間です' : '設定した寿命をもとにした目安です'}
      </p>
    </section>
  );
};

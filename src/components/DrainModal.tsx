import React, { useEffect } from 'react';
import { ShieldCheck, Sparkles, ArrowRight, Sun } from 'lucide-react';
import { formatMsToReadable } from '../utils/lifeCalc';
import { audioSynth } from '../utils/AudioEffects';

interface PreservedModalProps {
  preservedMs: number;
  onClose: () => void;
}

const POSITIVE_QUOTES = [
  "「画面を閉じている時間こそ、あなたが本当に『自分の人生』を生きている時間である。」",
  "「スマホを置き、現実世界を見つめることで、失われつつあった命の時間を取り戻しました。」— Memento Vitae",
  "「スクリーンから離れた静寂の中で、あなたの人生は守られています。」",
  "「素晴らしいデジタルデトックス！画面を点灯していない間、命の消費を防ぎました。」"
];

export const DrainModal: React.FC<PreservedModalProps> = ({ preservedMs, onClose }) => {
  const quote = React.useMemo(() => {
    return POSITIVE_QUOTES[Math.floor(Math.random() * POSITIVE_QUOTES.length)];
  }, []);

  useEffect(() => {
    // Play serene uplifting chord when modal appears
    audioSynth.playPreserveSound();
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="drain-modal-content"
        style={{
          background: 'radial-gradient(circle at center, #0a1f18 0%, #0d111a 100%)',
          borderColor: 'var(--accent-emerald)',
          boxShadow: '0 0 60px rgba(0, 255, 170, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="drain-icon-wrapper"
          style={{
            background: 'rgba(0, 255, 170, 0.15)',
            borderColor: 'var(--accent-emerald)',
            color: 'var(--accent-emerald)',
            boxShadow: '0 0 25px rgba(0, 255, 170, 0.5)'
          }}
        >
          <ShieldCheck size={38} />
        </div>

        <div className="drain-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#fff' }}>
          <Sparkles color="var(--accent-emerald)" size={22} />
          画面消灯により人生時間を保護！
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          画面を消して現実世界を生きられていた時間:
        </p>

        <div
          className="drain-time-large"
          style={{
            color: 'var(--accent-emerald)',
            textShadow: '0 0 20px rgba(0, 255, 170, 0.6)'
          }}
        >
          +{formatMsToReadable(preservedMs)}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          ✨ 画面をオフにしていたこの時間はプラス要素として人生に還元されます。
        </p>

        <div className="drain-quote" style={{ borderLeftColor: 'var(--accent-emerald)' }}>
          {quote}
        </div>

        <button
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #009966 100%)',
            boxShadow: '0 4px 15px rgba(0, 255, 170, 0.4)'
          }}
          onClick={onClose}
        >
          <Sun size={18} /> スクリーンタイマーを再開する <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

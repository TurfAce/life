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
  const quote = POSITIVE_QUOTES[Math.abs(Math.floor(preservedMs / 1000)) % POSITIVE_QUOTES.length];

  useEffect(() => {
    // Play serene uplifting chord when modal appears
    audioSynth.playPreserveSound();
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="drain-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="drain-icon-wrapper">
          <ShieldCheck size={38} />
        </div>

        <div className="drain-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Sparkles size={22} />
          自分の時間が増えました
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          画面から離れて過ごせた時間
        </p>

        <div className="drain-time-large">
          +{formatMsToReadable(preservedMs)}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          この時間を「守れた時間」として記録しました。
        </p>

        <div className="drain-quote">
          {quote}
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%' }}
          onClick={onClose}
        >
          <Sun size={18} /> 計測を再開する <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

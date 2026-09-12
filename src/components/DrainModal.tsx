import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { formatMsToReadable } from '../utils/lifeCalc';
import { audioSynth } from '../utils/AudioEffects';

interface PreservedToastProps {
  preservedMs: number;
  onClose: () => void;
}

export const DrainModal: React.FC<PreservedToastProps> = ({ preservedMs, onClose }) => {
  useEffect(() => {
    audioSynth.playPreserveSound();
    const timeout = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="preserved-toast" role="status" aria-live="polite">
      <div className="toast-icon"><Check size={17} /></div>
      <div className="toast-copy">
        <strong>画面を離れた時間を記録しました</strong>
        <span>+{formatMsToReadable(preservedMs)}</span>
      </div>
      <button type="button" onClick={onClose} aria-label="通知を閉じる"><X size={16} /></button>
    </div>
  );
};

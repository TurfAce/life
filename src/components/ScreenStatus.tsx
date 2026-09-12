import React, { useState } from 'react';
import { Monitor, Sun, Moon, ShieldCheck } from 'lucide-react';

interface ScreenStatusProps {
  isScreenActive: boolean;
  onSimulateScreenOff: () => void;
}

export const ScreenStatus: React.FC<ScreenStatusProps> = ({ isScreenActive, onSimulateScreenOff }) => {
  const [wakeLockSupported] = useState(() => 'wakeLock' in navigator);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [wakeLockObj, setWakeLockObj] = useState<WakeLockSentinel | null>(null);

  const toggleWakeLock = async () => {
    if (!wakeLockSupported) return;

    if (isWakeLockActive && wakeLockObj) {
      await wakeLockObj.release();
      setWakeLockObj(null);
      setIsWakeLockActive(false);
    } else {
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        setWakeLockObj(sentinel);
        setIsWakeLockActive(true);
        sentinel.addEventListener('release', () => {
          setIsWakeLockActive(false);
          setWakeLockObj(null);
        });
      } catch (err) {
        console.warn('Wake Lock failed', err);
      }
    }
  };

  return (
    <div className="glass-panel">
      <div className="section-title">
        <Monitor size={20} />
        スクリーンの状態
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="screen-state-row">
          <span className="screen-state-label">現在の状態</span>
          <span className={`status-pill ${isScreenActive ? 'off' : ''}`}>
            {isScreenActive ? (
              <>
                <Sun size={14} /> 画面はオン
              </>
            ) : (
              <>
                <Moon size={14} /> 画面はオフ
              </>
            )}
          </span>
        </div>

        <p className="helper-text">
          タブを切り替えても画面がついている間は計測が続きます。端末のロックやスリープで「画面を離れた時間」に切り替わります。
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {wakeLockSupported && (
            <button className={`btn-secondary ${isWakeLockActive ? 'active' : ''}`} onClick={toggleWakeLock}>
              <Sun size={16} color={isWakeLockActive ? 'var(--accent-amber)' : 'inherit'} />
              {isWakeLockActive ? '常時点灯を解除' : '画面を常時点灯'}
            </button>
          )}

          <button className="btn-secondary btn-gentle" onClick={onSimulateScreenOff}>
            <ShieldCheck size={16} />
            画面オフを試す
          </button>
        </div>
      </div>
    </div>
  );
};

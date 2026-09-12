import React, { useState } from 'react';
import { Moon, ShieldCheck, Sun } from 'lucide-react';

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
      return;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      setWakeLockObj(sentinel);
      setIsWakeLockActive(true);
      sentinel.addEventListener('release', () => {
        setIsWakeLockActive(false);
        setWakeLockObj(null);
      });
    } catch (error) {
      console.warn('Wake Lock failed', error);
    }
  };

  return (
    <div className="screen-settings">
      <div className="screen-state-row">
        <span>現在の状態</span>
        <span className={`status-pill ${isScreenActive ? 'is-active' : ''}`}>
          {isScreenActive ? <><Sun size={14} /> 画面はオン</> : <><Moon size={14} /> 画面はオフ</>}
        </span>
      </div>
      <p className="settings-helper">
        タブを切り替えても、端末の画面がついている間は計測が続きます。ロックやスリープ中は「画面を離れた時間」として記録します。
      </p>
      {wakeLockSupported && (
        <button type="button" className="settings-action" onClick={toggleWakeLock}>
          <Sun size={17} />
          {isWakeLockActive ? '画面の常時点灯を解除' : '画面を常時点灯する'}
        </button>
      )}
      <details className="developer-settings">
        <summary>開発者向け</summary>
        <button type="button" className="settings-action" onClick={onSimulateScreenOff}>
          <ShieldCheck size={17} /> 画面オフの記録をテスト
        </button>
      </details>
    </div>
  );
};

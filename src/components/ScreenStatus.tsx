import React, { useState, useEffect } from 'react';
import { Monitor, Sun, Moon, ShieldCheck } from 'lucide-react';

interface ScreenStatusProps {
  isScreenActive: boolean;
  onSimulateScreenOff: () => void;
}

export const ScreenStatus: React.FC<ScreenStatusProps> = ({ isScreenActive, onSimulateScreenOff }) => {
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [wakeLockObj, setWakeLockObj] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    if ('wakeLock' in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

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
        物理画面センサー ＆ ステータス
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>現在の画面センサー状態:</span>
          <span className={`status-pill ${isScreenActive ? 'off' : ''}`}>
            {isScreenActive ? (
              <>
                <Sun size={14} /> 物理画面点灯中 (マイナス消費)
              </>
            ) : (
              <>
                <Moon size={14} /> 物理画面消灯中 (プラス保護)
              </>
            )}
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          💡 <strong>判定仕様:</strong> タブを離れても画面がついている間は【マイナス】であり続けます。スマホ・PCの画面が物理的に消灯・ロック・スリープした時間のみが【プラス（時間の保護）】として加算されます。
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {wakeLockSupported && (
            <button className={`btn-secondary ${isWakeLockActive ? 'active' : ''}`} onClick={toggleWakeLock}>
              <Sun size={16} color={isWakeLockActive ? 'var(--accent-amber)' : 'inherit'} />
              {isWakeLockActive ? '常時点灯: ON' : '常時点灯: OFF'}
            </button>
          )}

          <button className="btn-secondary" style={{ borderColor: 'rgba(0, 255, 170, 0.4)' }} onClick={onSimulateScreenOff}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            物理画面消灯（プラス還元）をテスト
          </button>
        </div>
      </div>
    </div>
  );
};

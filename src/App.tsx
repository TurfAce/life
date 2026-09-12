import { useState, useEffect, useRef, useCallback } from 'react';
import { Hourglass, Settings, Volume2, VolumeX, Sparkles, ShieldCheck } from 'lucide-react';
import {
  DEFAULT_CONFIG,
  calculateRemainingLife,
  formatMsToReadable
} from './utils/lifeCalc';
import type { UserConfig, SessionLog, RemainingTimeDetails } from './utils/lifeCalc';
import { audioSynth } from './utils/AudioEffects';
import { LifeTimer } from './components/LifeTimer';
import { GaugeCanvas } from './components/GaugeCanvas';
import { DrainModal } from './components/DrainModal';
import { ScreenStatus } from './components/ScreenStatus';
import { HistoryLog } from './components/HistoryLog';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  // Config state
  const [config, setConfig] = useState<UserConfig>(() => {
    const saved = localStorage.getItem('chronos_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Session logs state
  const [logs, setLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('chronos_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Accumulated screen-on time (drains life - minus)
  const [totalScreenOnMs, setTotalScreenOnMs] = useState<number>(() => {
    const saved = localStorage.getItem('chronos_total_screen_on_ms');
    return saved ? Number(saved) : 0;
  });

  // Accumulated preserved screen-off time (restores/protects life - plus)
  const [totalPreservedLifeMs, setTotalPreservedLifeMs] = useState<number>(() => {
    const saved = localStorage.getItem('chronos_total_preserved_ms');
    return saved ? Number(saved) : 0;
  });

  // Audio enabled state
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  // Physical Screen status (true = Screen ON, false = Screen OFF / Locked)
  const [isPhysicalScreenOn, setIsPhysicalScreenOn] = useState<boolean>(true);

  // Active preserved popup modal state
  const [recentPreservedMs, setRecentPreservedMs] = useState<number | null>(null);

  // Settings modal open state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Calculated remaining time details state
  const [remainingDetails, setRemainingDetails] = useState<RemainingTimeDetails>(() =>
    calculateRemainingLife(config, totalScreenOnMs, totalPreservedLifeMs)
  );

  const lastTickTimeRef = useRef<number>(Date.now());
  const isScreenOffHandledRef = useRef<boolean>(false);

  // Save config to localStorage
  const handleSaveConfig = (newConfig: UserConfig) => {
    setConfig(newConfig);
    localStorage.setItem('chronos_config', JSON.stringify(newConfig));
  };

  // Reset all data
  const handleResetAll = () => {
    setConfig(DEFAULT_CONFIG);
    setLogs([]);
    setTotalScreenOnMs(0);
    setTotalPreservedLifeMs(0);
    localStorage.removeItem('chronos_config');
    localStorage.removeItem('chronos_logs');
    localStorage.removeItem('chronos_total_screen_on_ms');
    localStorage.removeItem('chronos_total_preserved_ms');
    localStorage.removeItem('chronos_last_tick_time');
  };

  // Clear log history only
  const handleClearLogs = () => {
    setLogs([]);
    setTotalPreservedLifeMs(0);
    localStorage.setItem('chronos_logs', JSON.stringify([]));
    localStorage.setItem('chronos_total_preserved_ms', '0');
  };

  // Process physical screen off duration (PLUS reward)
  const awardScreenOffTime = useCallback((durationMs: number, startTime: number, endTime: number) => {
    if (durationMs > 1500) {
      const newLog: SessionLog = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'SCREEN_OFF_PRESERVED',
        startTime,
        endTime,
        durationMs,
        formattedDuration: formatMsToReadable(durationMs)
      };

      setLogs((prev) => {
        const updated = [newLog, ...prev];
        localStorage.setItem('chronos_logs', JSON.stringify(updated));
        return updated;
      });

      setTotalPreservedLifeMs((prev) => {
        const updated = prev + durationMs;
        localStorage.setItem('chronos_total_preserved_ms', String(updated));
        return updated;
      });

      setRecentPreservedMs(durationMs);
    }
  }, []);

  // Manual test simulation of physical screen off
  const handleSimulateScreenOff = () => {
    const simulatedOffMs = 45 * 1000;
    const now = Date.now();
    awardScreenOffTime(simulatedOffMs, now - simulatedOffMs, now);
  };

  // Main loop: Detects continuous screen-on ticks vs OS Freeze / Physical Screen Off
  useEffect(() => {
    lastTickTimeRef.current = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;
      localStorage.setItem('chronos_last_tick_time', String(now));

      // THRESHOLD: 3500ms
      // If tick delta is <= 3500ms, JS was running continuously.
      // Even if user switched tabs on PC, browser ticks background tabs -> Screen is physically ON -> MINUS!
      if (delta <= 3500) {
        setIsPhysicalScreenOn(true);
        setTotalScreenOnMs((prev) => {
          const updated = prev + delta;
          localStorage.setItem('chronos_total_screen_on_ms', String(updated));
          return updated;
        });
      } else {
        // Delta > 3500ms means JS thread froze because OS slept / screen turned off / device locked!
        // This duration is PHYSICALLY SCREEN OFF -> PLUS (Life Preserved)!
        setIsPhysicalScreenOn(false);
        const offDurationMs = delta;
        awardScreenOffTime(offDurationMs, now - offDurationMs, now);
      }

      const details = calculateRemainingLife(config, totalScreenOnMs, totalPreservedLifeMs, now);
      setRemainingDetails(details);

      if (audioEnabled && details.milliseconds < 35) {
        audioSynth.playTick();
      }
    }, 33);

    // Page Lifecycle: Listen for OS freeze / resume
    const handleFreeze = () => {
      setIsPhysicalScreenOn(false);
      localStorage.setItem('chronos_freeze_time', String(Date.now()));
    };

    const handleResume = () => {
      setIsPhysicalScreenOn(true);
      const freezeTs = Number(localStorage.getItem('chronos_freeze_time'));
      if (freezeTs && !isScreenOffHandledRef.current) {
        const now = Date.now();
        const duration = now - freezeTs;
        awardScreenOffTime(duration, freezeTs, now);
        localStorage.removeItem('chronos_freeze_time');
      }
    };

    document.addEventListener('freeze', handleFreeze);
    document.addEventListener('resume', handleResume);

    return () => {
      clearInterval(timer);
      document.removeEventListener('freeze', handleFreeze);
      document.removeEventListener('resume', handleResume);
    };
  }, [config, totalScreenOnMs, totalPreservedLifeMs, audioEnabled, awardScreenOffTime]);

  const toggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    audioSynth.setEnabled(nextState);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-title">
          <Hourglass size={28} color="var(--accent-crimson)" />
          <div>
            <h1>CHRONOS</h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
              PHYSICAL SCREEN DETECTOR & LIFE TIMER
            </div>
          </div>
          <div className="brand-badge" style={{ background: 'rgba(0, 255, 170, 0.12)', color: 'var(--accent-emerald)', borderColor: 'rgba(0, 255, 170, 0.3)' }}>
            <div className="live-dot" style={{ backgroundColor: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} /> HARDWARE SENSOR
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-icon" onClick={toggleAudio} title={audioEnabled ? 'サウンド OFF' : 'サウンド ON'}>
            {audioEnabled ? <Volume2 size={20} color="var(--accent-cyan)" /> : <VolumeX size={20} color="var(--text-muted)" />}
          </button>

          <button className="btn-icon" onClick={() => setIsSettingsOpen(true)} title="設定">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Hero Timer Display */}
      <LifeTimer details={remainingDetails} isScreenActive={isPhysicalScreenOn} />

      {/* Main Visual Dashboard */}
      <div className="dashboard-grid">
        {/* Left: Liquid Ring Visual Gauge */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="section-title" style={{ width: '100%' }}>
            <Sparkles size={20} />
            残り時間ビジュアルゲージ
          </div>
          <GaugeCanvas percentage={remainingDetails.percentageRemaining} isDraining={isPhysicalScreenOn} />
        </div>

        {/* Right: Screen Detector & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ScreenStatus isScreenActive={isPhysicalScreenOn} onSimulateScreenOff={handleSimulateScreenOff} />

          <div className="glass-panel" style={{ background: 'rgba(0, 255, 170, 0.05)', borderColor: 'rgba(0, 255, 170, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} />
              物理画面消灯判定ロジック
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>画面点灯中（タブ切り替え含む）:</strong> マイナスカウント。画面が物理的に点灯している間はタブを離れていても人生が消費され続けます。<br/>
              <strong>物理画面消灯（端末ロック/スリープ）:</strong> プラス還元。スマホやPCの画面自体が消灯・ロックされた時間のみが時間を護るプラス要素となります。
            </p>
          </div>
        </div>
      </div>

      {/* History Log Section */}
      <HistoryLog logs={logs} onClearLogs={handleClearLogs} />

      {/* Preserved Alert Popup */}
      {recentPreservedMs !== null && (
        <DrainModal preservedMs={recentPreservedMs} onClose={() => setRecentPreservedMs(null)} />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          config={config}
          onSave={handleSaveConfig}
          onResetAll={handleResetAll}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

import { useState, useEffect, useRef, useCallback } from 'react';
import { CalendarDays, Hourglass, Settings, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
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

const APP_BOOT_TIME = Date.now();

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
    calculateRemainingLife(config, totalScreenOnMs, totalPreservedLifeMs, APP_BOOT_TIME)
  );
  const [currentTimeMs, setCurrentTimeMs] = useState(APP_BOOT_TIME);

  const lastTickTimeRef = useRef<number>(APP_BOOT_TIME);
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
      setCurrentTimeMs(now);
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
    }, 100);

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

  const todayStart = new Date(currentTimeMs);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dailyPercentageRemaining = Math.max(
    0,
    Math.min(100, ((tomorrowStart.getTime() - currentTimeMs) / (tomorrowStart.getTime() - todayStart.getTime())) * 100)
  );

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-title">
          <div className="brand-mark"><Hourglass size={22} /></div>
          <div>
            <h1>Chronos</h1>
            <div className="brand-subtitle">自分の時間を、ていねいに</div>
          </div>
          <div className="brand-badge">
            <div className="live-dot" /> 計測中
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-icon" onClick={toggleAudio} title={audioEnabled ? 'サウンド OFF' : 'サウンド ON'}>
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button className="btn-icon" onClick={() => setIsSettingsOpen(true)} title="設定">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Hero Timer Display */}
      <LifeTimer details={remainingDetails} isScreenActive={isPhysicalScreenOn} />

      {/* Lifetime and daily views */}
      <div className="timeline-grid">
        <div className="glass-panel gauge-panel gauge-panel-life">
          <div className="section-title">
            <Hourglass size={20} />
            一生の時間
          </div>
          <GaugeCanvas percentage={remainingDetails.percentageRemaining} isDraining={isPhysicalScreenOn} />
        </div>

        <div className="glass-panel gauge-panel gauge-panel-day">
          <div className="section-title">
            <CalendarDays size={20} />
            今日の時間
          </div>
          <GaugeCanvas percentage={dailyPercentageRemaining} isDraining={isPhysicalScreenOn} scope="day" />
        </div>
      </div>

      {/* Screen Detector & Status */}
      <div className="dashboard-grid status-grid">
        <div>
          <ScreenStatus isScreenActive={isPhysicalScreenOn} onSimulateScreenOff={handleSimulateScreenOff} />
        </div>
        <div className="glass-panel how-it-works-card">
            <div className="info-heading">
              <ShieldCheck size={18} />
              このアプリの考え方
            </div>
            <p>
              画面を見ている間は時間が進み、端末をロックしたりスリープすると、その時間を「守れた時間」として記録します。少し画面を置いて、自分のための時間を増やしてみましょう。
            </p>
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

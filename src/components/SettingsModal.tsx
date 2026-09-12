import React, { useEffect, useState } from 'react';
import { Info, Monitor, RotateCcw, Save, Settings, Volume2, VolumeX, X, Zap } from 'lucide-react';
import type { UserConfig } from '../utils/lifeCalc';
import { ScreenStatus } from './ScreenStatus';

interface SettingsModalProps {
  config: UserConfig;
  audioEnabled: boolean;
  isScreenActive: boolean;
  onSave: (newConfig: UserConfig) => void;
  onResetAll: () => void;
  onToggleAudio: () => void;
  onSimulateScreenOff: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  audioEnabled,
  isScreenActive,
  onSave,
  onResetAll,
  onToggleAudio,
  onSimulateScreenOff,
  onClose
}) => {
  const [birthDate, setBirthDate] = useState(config.birthDate);
  const [birthTime, setBirthTime] = useState(config.birthTime);
  const [expectedAge, setExpectedAge] = useState(config.expectedAge);
  const [subtractSleepHoursDaily, setSubtractSleepHoursDaily] = useState(config.subtractSleepHoursDaily);
  const [screenDrainSpeed, setScreenDrainSpeed] = useState(config.screenDrainSpeed || 1);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      birthDate,
      birthTime,
      expectedAge: Number(expectedAge),
      subtractSleepHoursDaily: Number(subtractSleepHoursDaily),
      screenDrainSpeed: Number(screenDrainSpeed)
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <h2 id="settings-title"><Settings size={21} /> 設定</h2>
          <button type="button" className="btn-icon btn-icon-small" onClick={onClose} aria-label="設定を閉じる" autoFocus>
            <X size={18} />
          </button>
        </header>

        <div className="settings-scroll">
          <form onSubmit={handleSubmit}>
            <section className="settings-section">
              <h3><Zap size={17} /> 時間の設定</h3>
              <div className="form-group">
                <label htmlFor="drain-speed">画面を見ている間の進み方</label>
                <select id="drain-speed" className="form-input" value={screenDrainSpeed} onChange={(event) => setScreenDrainSpeed(Number(event.target.value))}>
                  <option value={1}>標準（実時間どおり）</option>
                  <option value={1.5}>少し速め（1.5倍）</option>
                  <option value={2}>速め（2倍）</option>
                  <option value={0.5}>ゆっくり（0.5倍）</option>
                </select>
              </div>
              <div className="settings-form-grid">
                <div className="form-group">
                  <label htmlFor="birth-date">生年月日</label>
                  <input id="birth-date" type="date" className="form-input" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="birth-time">出生時間</label>
                  <input id="birth-time" type="time" className="form-input" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="expected-age">想定する寿命（年）</label>
                  <input id="expected-age" type="number" min="1" max="130" className="form-input" value={expectedAge} onChange={(event) => setExpectedAge(Number(event.target.value))} required />
                </div>
                <div className="form-group">
                  <label htmlFor="sleep-hours">睡眠として差し引く時間／日</label>
                  <input id="sleep-hours" type="number" min="0" max="16" className="form-input" value={subtractSleepHoursDaily} onChange={(event) => setSubtractSleepHoursDaily(Number(event.target.value))} />
                </div>
              </div>
            </section>

            <section className="settings-section">
              <h3>{audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />} サウンド</h3>
              <div className="settings-row">
                <div><strong>効果音</strong><span>記録時の音を再生します</span></div>
                <button type="button" className={`switch-control ${audioEnabled ? 'is-on' : ''}`} role="switch" aria-checked={audioEnabled} onClick={onToggleAudio}>
                  <span aria-hidden="true" />
                  <b>{audioEnabled ? 'オン' : 'オフ'}</b>
                </button>
              </div>
            </section>

            <section className="settings-section">
              <h3><Monitor size={17} /> 計測について</h3>
              <ScreenStatus isScreenActive={isScreenActive} onSimulateScreenOff={onSimulateScreenOff} />
            </section>

            <section className="settings-section about-section">
              <h3><Info size={17} /> このアプリについて</h3>
              <p>画面から離れた時間を記録し、限りある時間を穏やかに意識するためのアプリです。一生の残り時間は、設定した生年月日と想定寿命をもとにした目安です。</p>
            </section>

            <div className="settings-footer">
              <button type="submit" className="btn-primary"><Save size={17} /> 保存する</button>
              <button
                type="button"
                className="reset-button"
                onClick={() => {
                  if (confirm('すべての記録と設定を初期化しますか？')) {
                    onResetAll();
                    onClose();
                  }
                }}
              >
                <RotateCcw size={16} /> すべてリセット
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

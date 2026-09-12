import React, { useState } from 'react';
import { Settings, Save, RotateCcw, X, Zap } from 'lucide-react';
import type { UserConfig } from '../utils/lifeCalc';

interface SettingsModalProps {
  config: UserConfig;
  onSave: (newConfig: UserConfig) => void;
  onResetAll: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSave, onResetAll, onClose }) => {
  const [birthDate, setBirthDate] = useState(config.birthDate);
  const [birthTime, setBirthTime] = useState(config.birthTime);
  const [expectedAge, setExpectedAge] = useState(config.expectedAge);
  const [subtractSleepHoursDaily, setSubtractSleepHoursDaily] = useState(config.subtractSleepHoursDaily);
  const [screenDrainSpeed, setScreenDrainSpeed] = useState(config.screenDrainSpeed || 1.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="drain-modal-content" style={{ textAlign: 'left', maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            <Settings size={22} color="var(--accent-cyan)" />
            人生時間 ＆ 消費スピード設定
          </div>
          <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>画面点灯時の消費スピード倍率 (Screen Drain Speed)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-input"
                style={{ flex: 1 }}
                value={screenDrainSpeed}
                onChange={(e) => setScreenDrainSpeed(Number(e.target.value))}
              >
                <option value={1.0}>1.0x (標準: 実時間通りのスピード 1秒/秒)</option>
                <option value={1.5}>1.5x (1.5倍速: スクリーンの警告度アップ)</option>
                <option value={2.0}>2.0x (2.0倍速: 重度のスクリーン依存警告)</option>
                <option value={0.5}>0.5x (0.5倍速: マイルド)</option>
              </select>
              <Zap size={18} color="var(--accent-amber)" />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ※ 秒数の減少しやすさ・カウントスピードをここで調整できます
            </span>
          </div>

          <div className="form-group">
            <label>生年月日 (Birth Date)</label>
            <input
              type="date"
              className="form-input"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>出生時間 (Birth Time)</label>
            <input
              type="time"
              className="form-input"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>想定寿命 (Expected Age in Years)</label>
            <input
              type="number"
              min="1"
              max="130"
              className="form-input"
              value={expectedAge}
              onChange={(e) => setExpectedAge(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label>1日の睡眠差し引き設定 (時間/日)</label>
            <input
              type="number"
              min="0"
              max="16"
              className="form-input"
              value={subtractSleepHoursDaily}
              onChange={(e) => setSubtractSleepHoursDaily(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <Save size={18} /> 保存する
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ color: 'var(--accent-crimson)', borderColor: 'rgba(255,42,85,0.3)' }}
              onClick={() => {
                if (confirm('すべての減算履歴と設定を初期化しますか？')) {
                  onResetAll();
                  onClose();
                }
              }}
            >
              <RotateCcw size={18} /> リセット
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

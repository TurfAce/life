import React, { useEffect } from 'react';
import { History, ShieldCheck, Trash2, X } from 'lucide-react';
import { formatMsToReadable } from '../utils/lifeCalc';
import type { SessionLog } from '../utils/lifeCalc';

interface HistoryLogProps {
  logs: SessionLog[];
  onClearLogs: () => void;
  onClose: () => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ logs, onClearLogs, onClose }) => {
  const totalPreservedMs = logs
    .filter((log) => log.type === 'SCREEN_OFF_PRESERVED')
    .reduce((acc, log) => acc + log.durationMs, 0);

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <section className="history-content">
      <div className="dialog-header">
        <h2>
          <History size={20} />
          画面を離れた記録
        </h2>
        <button type="button" className="btn-icon btn-icon-small" onClick={onClose} aria-label="記録を閉じる" autoFocus><X size={18} /></button>
      </div>

      <div className="history-total">
        <span>画面を離れた時間（累計）</span>
        <strong>{formatMsToReadable(totalPreservedMs)}</strong>
      </div>

      <div className="history-list">
        {logs.length === 0 ? (
          <div className="empty-history">
            画面を離れると、ここに記録が残ります。
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="history-item">
              <div className="history-meta">
                <ShieldCheck size={16} />
                <span>{formatTimestamp(log.endTime)} 復帰</span>
              </div>
              <div className="history-deduction">
                +{log.formattedDuration}
              </div>
            </div>
          ))
        )}
      </div>
      {logs.length > 0 && (
        <button type="button" className="clear-history-button" onClick={onClearLogs}>
          <Trash2 size={15} /> 履歴を消去
        </button>
      )}
    </section>
  );
};

import React from 'react';
import { History, ShieldCheck, Trash2 } from 'lucide-react';
import { formatMsToReadable } from '../utils/lifeCalc';
import type { SessionLog } from '../utils/lifeCalc';

interface HistoryLogProps {
  logs: SessionLog[];
  onClearLogs: () => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ logs, onClearLogs }) => {
  const totalPreservedMs = logs
    .filter((log) => log.type === 'SCREEN_OFF_PRESERVED')
    .reduce((acc, log) => acc + log.durationMs, 0);

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          <History size={20} />
          画面を離れた記録
        </div>
        {logs.length > 0 && (
          <button
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={onClearLogs}
            title="履歴をクリア"
          >
            <Trash2 size={16} color="var(--text-muted)" />
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1rem', background: '#edf6f2', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d8e8e2' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>これまでに守れた時間 </span>
        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginLeft: '0.5rem', fontSize: '1rem' }}>
          +{formatMsToReadable(totalPreservedMs)}
        </strong>
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
                <ShieldCheck size={16} color="var(--accent-emerald)" />
                <span>{formatTimestamp(log.endTime)} 復帰</span>
              </div>
              <div className="history-deduction" style={{ color: 'var(--accent-emerald)' }}>
                +{log.formattedDuration}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

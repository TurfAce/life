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
          画面消灯・ロックによる人生時間保護ログ
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

      <div style={{ marginBottom: '1rem', background: 'rgba(0, 255, 170, 0.08)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 255, 170, 0.25)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>画面をオフにして護った累計時間（プラス要素）: </span>
        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginLeft: '0.5rem', fontSize: '1rem' }}>
          +{formatMsToReadable(totalPreservedMs)}
        </strong>
      </div>

      <div className="history-list">
        {logs.length === 0 ? (
          <div className="empty-history">
            画面消灯による時間保護の記録はまだありません。
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="history-item" style={{ borderColor: 'rgba(0, 255, 170, 0.2)' }}>
              <div className="history-meta">
                <ShieldCheck size={16} color="var(--accent-emerald)" />
                <span>{formatTimestamp(log.endTime)} 復帰</span>
              </div>
              <div className="history-deduction" style={{ color: 'var(--accent-emerald)' }}>
                +{log.formattedDuration} (保護)
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'chronos_focus_v1';
const DURATION = 20 * 60 * 1000;
type Session = { id: string; activity: string; startedAt: number; endsAt: number; finishedAt?: number };
type Entry = Session & { finishedAt: number; note: string; completed: boolean };
type FocusData = { active: Session | null; entries: Entry[] };
const empty: FocusData = { active: null, entries: [] };

function readData(): FocusData {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!data || !Array.isArray(data.entries)) return empty;
    const valid = (s: Session) => s && typeof s.id === 'string' && typeof s.activity === 'string' && Number.isFinite(s.startedAt) && Number.isFinite(s.endsAt);
    return { active: valid(data.active) ? data.active : null, entries: data.entries.filter((s: Entry) => valid(s) && Number.isFinite(s.finishedAt) && typeof s.note === 'string') };
  } catch { return empty; }
}

export function FocusSession() {
  const [data, setData] = useState<FocusData>(readData);
  const [activity, setActivity] = useState('本を読む');
  const [note, setNote] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const active = data.active;
  const reviewing = !!active && (!!active.finishedAt || now >= active.endsAt);
  const seconds = active ? Math.max(0, Math.ceil((active.endsAt - now) / 1000)) : 0;

  useEffect(() => {
    if (!active || active.finishedAt) return;
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('pageshow', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); window.removeEventListener('pageshow', tick); };
  }, [active]);

  function commit(next: FocusData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setData(next);
      setError('');
      return true;
    } catch {
      setError('端末に保存できませんでした。ブラウザの保存設定や空き容量を確認して、もう一度お試しください。');
      return false;
    }
  }

  function start() {
    const startedAt = Date.now();
    if (!activity.trim()) return;
    if (commit({ ...data, active: { id: crypto.randomUUID(), activity: activity.trim(), startedAt, endsAt: startedAt + DURATION } })) {
      setNow(startedAt); setNote(''); setMessage('');
    }
  }

  function save() {
    if (!active) return;
    const finishedAt = active.finishedAt ?? active.endsAt;
    const entry: Entry = { ...active, finishedAt, completed: finishedAt >= active.endsAt, note: note.trim() };
    if (commit({ active: null, entries: [entry, ...data.entries] })) {
      setNote(''); setMessage('できたことを記録しました。おつかれさまでした。');
    }
  }

  return (
    <section className="focus-session" aria-labelledby="focus-title">
      <h2 id="focus-title">{active ? active.activity : '自分のための20分'}</h2>
      {!active ? (
        <>
          <p className="focus-description">画面を置いて、やりたかったことを一つ。</p>
          <form onSubmit={(event) => { event.preventDefault(); start(); }}>
            <div className="focus-choices" aria-label="行動の候補">
              {['本を読む', '勉強する', '散歩する', '体を動かす'].map((item) => (
                <button type="button" key={item} aria-pressed={activity === item} onClick={() => setActivity(item)}>{item}</button>
              ))}
            </div>
            <label className="focus-input-label" htmlFor="focus-activity">この時間にすること</label>
            <input id="focus-activity" className="form-input" maxLength={80} required value={activity} onChange={(event) => setActivity(event.target.value)} />
            <button className="btn-primary focus-start" disabled={!activity.trim()}>20分の集中を始める</button>
          </form>
        </>
      ) : reviewing ? (
        <form onSubmit={(event) => { event.preventDefault(); save(); }}>
          <p className="focus-description">{active.finishedAt && active.finishedAt < active.endsAt ? 'ここまでの時間を振り返りましょう。' : '20分が経ちました。何ができましたか？'}</p>
          <label className="focus-input-label" htmlFor="focus-note">できたこと（任意）</label>
          <textarea id="focus-note" className="form-input" rows={3} maxLength={500} placeholder="本を10ページ読めた、など" value={note} onChange={(event) => setNote(event.target.value)} />
          <button className="btn-primary focus-start">{note.trim() ? 'できたことを記録する' : 'メモなしで記録する'}</button>
          <button type="button" className="detail-toggle" onClick={() => { if (commit({ ...data, active: null })) setMessage('今回は記録せずに終了しました。'); }}>今回は記録せず終了</button>
        </form>
      ) : (
        <>
          <p className="focus-countdown" role="timer" aria-label="集中の残り時間">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</p>
          <p className="focus-description">画面を閉じて大丈夫です。戻ったときに振り返れます。</p>
          <p className="focus-description">他のアプリの利用は制限しません。</p>
          <button type="button" className="detail-toggle" onClick={() => {
            const finishedAt = Date.now(); setNow(finishedAt);
            commit({ ...data, active: { ...active, finishedAt: Math.min(finishedAt, active.endsAt) } });
          }}>ここまでで終了する</button>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {message && <p className="focus-description" role="status">{message}</p>}
      <details className="focus-records">
        <summary>できたことの記録 · {data.entries.length}件</summary>
        <p className="focus-description">自分で振り返って保存した記録です。このブラウザに保存されます。</p>
        {!data.entries.length && <p className="focus-description">最初の20分から、少しずつ。</p>}
        <ul>{data.entries.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.activity}</strong>
            <span>{new Date(entry.startedAt).toLocaleDateString('ja-JP')} · {entry.completed ? '20分' : `${Math.floor(Math.max(0, entry.finishedAt - entry.startedAt) / 60000)}分（途中終了）`}</span>
            {entry.note && <p>{entry.note}</p>}
          </li>
        ))}</ul>
      </details>
    </section>
  );
}

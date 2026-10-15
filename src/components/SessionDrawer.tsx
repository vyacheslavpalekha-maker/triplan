import React, { useEffect } from 'react';
import type { BoardSession } from '../lib/schedule';
import { INTENSITY_COLOR, INTENSITY_LABEL, sessionLook, splitWorkout } from '../lib/schedule';

interface Props {
  session: BoardSession | null;
  dateLabel: string;
  done: boolean;
  canComplete: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const SessionDrawer: React.FC<Props> = ({
  session,
  dateLabel,
  done,
  canComplete,
  onClose,
  onComplete,
}) => {
  useEffect(() => {
    if (!session) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [session, onClose]);

  if (!session) return null;

  const look = sessionLook(session);
  const sections = splitWorkout(session.details);

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(15, 23, 32, 0.45)' }}
        onClick={onClose}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--bg-primary)', borderLeft: '1px solid var(--border-color)' }}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-5" style={{ borderBottom: `3px solid ${look.color}` }}>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide" style={{ color: look.color }}>
              {look.name} · {dateLabel}
            </div>
            <h2 className="mt-1 text-lg font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {session.description}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full px-2 py-1" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {session.duration} мин
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[session.intensity] }} />
                {INTENSITY_LABEL[session.intensity]}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            aria-label="Закрыть панель"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                {section.body}
              </p>
            </section>
          ))}

          <div className="grid gap-2">
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Пульс</div>
              <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{session.targetHR}</div>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Темп / мощность</div>
              <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{session.targetPace}</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          {done ? (
            <div className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold" style={{ backgroundColor: 'rgba(0, 200, 83, 0.12)', color: '#00a844' }}>
              <i className="fas fa-check" />
              Уже в журнале
            </div>
          ) : canComplete ? (
            <button type="button" onClick={onComplete} className="garmin-btn w-full">
              Выполнено
            </button>
          ) : (
            <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Эта тренировка ещё впереди
            </p>
          )}
        </div>
      </aside>
    </div>
  );
};

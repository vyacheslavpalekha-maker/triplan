import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { AthleteProfile, RaceConfig, TrainingLogEntry } from '../types';
import { analyzeHealthRestrictions } from '../healthAnalyzer';
import type { BoardSession, BoardWeek } from '../lib/schedule';
import {
  DAY_NAMES,
  DAY_FULL,
  INTENSITY_COLOR,
  INTENSITY_LABEL,
  canCompleteOn,
  isSessionDone,
  phaseColor,
  sessionDate,
  sessionLook,
  toLocalIso,
} from '../lib/schedule';
import { SessionDrawer } from './SessionDrawer';

interface Props {
  plans: BoardWeek[];
  weekNumber: number;
  raceConfig: RaceConfig;
  profile: AthleteProfile;
  log: TrainingLogEntry[];
  onWeekChange: (week: number) => void;
  onMove: (boardId: string, day: number) => void;
  onComplete: (session: BoardSession, weekNumber: number, date: string) => void;
}

const collision: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args);
  return byPointer.length > 0 ? byPointer : rectIntersection(args);
};

export const WeekBoard: React.FC<Props> = ({
  plans,
  weekNumber,
  raceConfig,
  profile,
  log,
  onWeekChange,
  onMove,
  onComplete,
}) => {
  const plan = plans[weekNumber - 1];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const healthRecs = analyzeHealthRestrictions(profile);
  const maxHours = Math.max(...plans.map((item) => item.totalHours), 1);

  if (!plan) return null;

  const active = plan.sessions.find((session) => session.boardId === activeId) ?? null;
  const openSession = plan.sessions.find((session) => session.boardId === openId) ?? null;
  const openDate = openSession
    ? sessionDate(raceConfig.raceDate, raceConfig.weeksToRace, weekNumber, openSession.day)
    : null;

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const overId = event.over?.id;
    if (!overId) return;
    const day = Number(String(overId).replace('day-', ''));
    const boardId = String(event.active.id);
    const session = plan.sessions.find((item) => item.boardId === boardId);
    if (!session || Number.isNaN(day) || session.day === day) return;
    onMove(boardId, day);
  };

  return (
    <div className="space-y-4">
      <div className="garmin-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Сезон</h3>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{plan.phase}</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex h-28 items-end gap-1" style={{ minWidth: Math.max(plans.length * 28, 320) }}>
            {plans.map((item) => {
              const height = Math.max(8, (item.totalHours / maxHours) * 72);
              const selected = item.weekNumber === weekNumber;
              return (
                <button
                  key={item.weekNumber}
                  type="button"
                  onClick={() => onWeekChange(item.weekNumber)}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  title={`Неделя ${item.weekNumber}: ${item.totalHours} ч · ${item.phase}`}
                >
                  <span
                    className="w-full rounded-t-md"
                    style={{
                      height,
                      backgroundColor: phaseColor(item.phase),
                      opacity: selected ? 1 : 0.45,
                      outline: selected ? '2px solid var(--text-primary)' : 'none',
                      outlineOffset: 1,
                    }}
                  />
                  <span className="text-[10px]" style={{ color: selected ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {item.weekNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="garmin-card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Неделя {weekNumber} из {raceConfig.weeksToRace}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {plan.totalHours} ч · плавание {plan.swimVolume} · вело {plan.bikeVolume} · бег {plan.runVolume} · TSS {plan.plannedTSS}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WeekStep label="Предыдущая неделя" icon="fa-chevron-left" disabled={weekNumber <= 1} onClick={() => onWeekChange(weekNumber - 1)} />
            <span className="min-w-14 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {weekNumber} / {raceConfig.weeksToRace}
            </span>
            <WeekStep label="Следующая неделя" icon="fa-chevron-right" disabled={weekNumber >= raceConfig.weeksToRace} onClick={() => onWeekChange(weekNumber + 1)} />
          </div>
        </div>

        {healthRecs.length > 0 && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: 'var(--text-secondary)' }}>
            <span className="font-medium" style={{ color: '#e67e00' }}>План учитывает ограничения. </span>
            {healthRecs[0].title.replace(/[⚠️ℹ️🚨]/g, '').trim()}: {healthRecs[0].adjustments[0]}
          </div>
        )}

        <p className="mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Потяните тренировку за маркер, чтобы перенести на другой день.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={collision}
          onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
          onDragCancel={() => setActiveId(null)}
          onDragEnd={onDragEnd}
        >
          <div className="overflow-x-auto pb-2">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, minmax(132px, 1fr))' }}>
              {DAY_NAMES.map((name, day) => {
                const date = sessionDate(raceConfig.raceDate, raceConfig.weeksToRace, weekNumber, day);
                const sessions = plan.sessions.filter((session) => session.day === day);
                return (
                  <DayColumn
                    key={day}
                    day={day}
                    name={name}
                    dateLabel={date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    isToday={toLocalIso(date) === toLocalIso(new Date())}
                    sessions={sessions}
                    log={log}
                    onOpen={setOpenId}
                  />
                );
              })}
            </div>
          </div>
          <DragOverlay>
            {active ? <SessionChip session={active} done={isSessionDone(log, active.boardId)} dragging /> : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-4 flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {(Object.keys(INTENSITY_LABEL) as Array<keyof typeof INTENSITY_LABEL>).map((key) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[key] }} />
              {INTENSITY_LABEL[key]}
            </span>
          ))}
        </div>
      </div>

      <SessionDrawer
        session={openSession}
        dateLabel={openDate ? `${DAY_FULL[openSession?.day ?? 0]}, ${openDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}` : ''}
        done={openSession ? isSessionDone(log, openSession.boardId) : false}
        canComplete={openDate ? canCompleteOn(openDate) : false}
        onClose={() => setOpenId(null)}
        onComplete={() => {
          if (!openSession || !openDate) return;
          onComplete(openSession, weekNumber, toLocalIso(openDate));
        }}
      />
    </div>
  );
};

function WeekStep({ label, icon, disabled, onClick }: { label: string; icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
      style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
    >
      <i className={`fas ${icon} text-xs`} />
    </button>
  );
}

function DayColumn({
  day,
  name,
  dateLabel,
  isToday,
  sessions,
  log,
  onOpen,
}: {
  day: number;
  name: string;
  dateLabel: string;
  isToday: boolean;
  sessions: BoardSession[];
  log: TrainingLogEntry[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-56 flex-col rounded-xl p-2"
      style={{
        backgroundColor: isOver ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
        outline: isToday ? '2px solid var(--accent-primary)' : isOver ? '2px solid var(--accent-primary)' : '1px solid transparent',
      }}
    >
      <div className="mb-2 text-center">
        <div className="text-xs font-semibold uppercase" style={{ color: isToday ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
          {name}{isToday ? ' · сегодня' : ''}
        </div>
        <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{dateLabel}</div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {sessions.map((session) => (
          <DraggableSession key={session.boardId} session={session} done={isSessionDone(log, session.boardId)} onOpen={() => onOpen(session.boardId)} />
        ))}
        {sessions.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
            Отдых
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableSession({ session, done, onOpen }: { session: BoardSession; done: boolean; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: session.boardId });
  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.35 : 1 }}>
      <SessionChip session={session} done={done} onOpen={onOpen} dragHandle={{ ...listeners, ...attributes }} />
    </div>
  );
}

function SessionChip({
  session,
  done,
  onOpen,
  dragHandle,
  dragging,
}: {
  session: BoardSession;
  done: boolean;
  onOpen?: () => void;
  dragHandle?: React.HTMLAttributes<HTMLButtonElement>;
  dragging?: boolean;
}) {
  const look = sessionLook(session);
  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        boxShadow: dragging ? '0 8px 24px rgba(0,0,0,0.18)' : undefined,
        width: dragging ? 150 : undefined,
      }}
    >
      <div className="h-1" style={{ backgroundColor: look.color }} />
      <div className="flex items-start gap-1 p-2">
        {dragHandle && (
          <button
            type="button"
            className="mt-0.5 flex h-6 w-5 shrink-0 cursor-grab items-center justify-center"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="Перенести тренировку"
            {...dragHandle}
          >
            <i className="fas fa-grip-vertical text-xs" />
          </button>
        )}
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-xs font-semibold" style={{ color: look.color }}>{look.name}</span>
            {done && <i className="fas fa-check text-[10px]" style={{ color: '#00c853' }} />}
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>{session.duration} мин</div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-snug" style={{ color: 'var(--text-tertiary)' }}>{session.description}</div>
        </button>
      </div>
    </div>
  );
}

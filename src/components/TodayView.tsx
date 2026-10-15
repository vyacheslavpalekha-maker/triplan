import React, { useMemo, useState } from 'react';
import type { AthleteProfile, Badge, RaceConfig, TrainingLogEntry } from '../types';
import { DISTANCE_INFO } from '../types';
import { calculateFitnessMetrics, getReadiness } from '../planGenerator';
import type { BoardSession, BoardWeek } from '../lib/schedule';
import {
  DAY_FULL,
  INTENSITY_COLOR,
  INTENSITY_LABEL,
  canCompleteOn,
  daysUntil,
  daysWord,
  greeting,
  isSessionDone,
  mondayIndex,
  planTimeline,
  sessionDate,
  sessionLook,
  toLocalIso,
} from '../lib/schedule';
import { PhaseStrip } from './PhaseStrip';
import { SessionDrawer } from './SessionDrawer';

interface GoalAnalysis {
  difficulty: 'easy' | 'realistic' | 'challenging' | 'unrealistic';
  message: string;
}

interface Props {
  profile: AthleteProfile;
  raceConfig: RaceConfig;
  plans: BoardWeek[];
  log: TrainingLogEntry[];
  badges: Badge[];
  goalAnalysis: GoalAnalysis;
  onComplete: (session: BoardSession, weekNumber: number, date: string) => void;
  onOpenWeek: (week: number) => void;
  onOpenProfile: () => void;
  onOpenJournal: () => void;
}

const GOAL_LABEL: Record<GoalAnalysis['difficulty'], string> = {
  easy: 'С запасом',
  realistic: 'В точку',
  challenging: 'Амбициозная',
  unrealistic: 'Слишком амбициозная',
};

const READINESS_COLOR = { green: '#00c853', yellow: '#ff9800', red: '#f44336' };

export const TodayView: React.FC<Props> = ({
  profile,
  raceConfig,
  plans,
  log,
  badges,
  goalAnalysis,
  onComplete,
  onOpenWeek,
  onOpenProfile,
  onOpenJournal,
}) => {
  const today = useMemo(() => new Date(), []);
  const timeline = planTimeline(raceConfig.raceDate, raceConfig.weeksToRace, today);
  const weekNumber = timeline.weekNumber;
  const dayIndex = mondayIndex(today);
  const plan = plans[weekNumber - 1];
  const todaySessions = timeline.status === 'during'
    ? (plan?.sessions ?? []).filter((session) => session.day === dayIndex)
    : [];
  const pending = todaySessions.filter((session) => !isSessionDone(log, session.boardId));
  const hero = pending[0] ?? todaySessions[0] ?? null;
  const upcoming = useMemo(
    () => findUpcoming(plans, timeline.status === 'before' ? 1 : weekNumber, timeline.status === 'before' ? -1 : dayIndex, raceConfig),
    [plans, weekNumber, dayIndex, raceConfig, timeline.status],
  );
  const daysLeft = daysUntil(raceConfig.raceDate, today);
  const readiness = getReadiness(log);
  const metrics = calculateFitnessMetrics(log);
  const doneThisWeek = (plan?.sessions ?? []).filter((session) => isSessionDone(log, session.boardId)).length;
  const [openId, setOpenId] = useState<string | null>(null);
  const openFromToday = (plan?.sessions ?? []).find((session) => session.boardId === openId) ?? null;
  const openSession = openFromToday ?? (upcoming?.session.boardId === openId ? upcoming.session : null);
  const openWeek = openFromToday ? weekNumber : (upcoming?.week ?? weekNumber);

  const dateLabel = (session: BoardSession, week: number) =>
    sessionDate(raceConfig.raceDate, raceConfig.weeksToRace, week, session.day)
      .toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="mt-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {greeting(today)}{profile.name ? `, ${profile.name}` : ''}
          </h2>
        </div>
        {!profile.name && (
          <button type="button" onClick={onOpenProfile} className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
            Заполнить профиль
          </button>
        )}
      </div>

      <div className="garmin-card p-4">
        <div className="mb-3 flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>{plan?.phase ?? 'План'}</span>
          <span>Неделя {weekNumber} из {raceConfig.weeksToRace}</span>
        </div>
        <PhaseStrip plans={plans} weekNumber={weekNumber} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {timeline.status === 'before' ? (
            <PlanWaitCard
              startLabel={timeline.planStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              upcoming={upcoming}
              onOpen={upcoming ? () => setOpenId(upcoming.session.boardId) : undefined}
            />
          ) : timeline.status === 'after' ? (
            <div className="garmin-card p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Старт прошёл</div>
              <h3 className="mt-2 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Гонка уже позади</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Журнал и сезон остаются на месте. Новую подготовку можно собрать в профиле.
              </p>
            </div>
          ) : hero ? (
            <HeroSession
              session={hero}
              done={isSessionDone(log, hero.boardId)}
              allDone={todaySessions.length > 0 && pending.length === 0}
              onOpen={() => setOpenId(hero.boardId)}
              onComplete={() => onComplete(hero, weekNumber, toLocalIso(sessionDate(raceConfig.raceDate, raceConfig.weeksToRace, weekNumber, hero.day)))}
            />
          ) : (
            <RestCard
              upcoming={upcoming}
              onOpen={upcoming ? () => setOpenId(upcoming.session.boardId) : undefined}
            />
          )}

          {todaySessions.length > 1 && (
            <div className="mt-4 space-y-2">
              {todaySessions.filter((session) => session.boardId !== hero?.boardId).map((session) => {
                const look = sessionLook(session);
                const done = isSessionDone(log, session.boardId);
                return (
                  <button
                    key={session.boardId}
                    type="button"
                    onClick={() => setOpenId(session.boardId)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-1 rounded-full" style={{ backgroundColor: look.color }} />
                      <span>
                        <span className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{look.name}</span>
                        <span className="block text-xs" style={{ color: 'var(--text-tertiary)' }}>{session.duration} мин</span>
                      </span>
                    </span>
                    {done && <i className="fas fa-check text-sm" style={{ color: '#00c853' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="garmin-card p-5">
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              {daysLeft > 0 ? 'До старта' : daysLeft === 0 ? 'Старт' : 'Старт был'}
            </div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-4xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
                {Math.abs(daysLeft)}
              </span>
              <span className="mb-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{daysWord(daysLeft)}</span>
            </div>
            <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {DISTANCE_INFO[raceConfig.distance].name}
              {raceConfig.targetTime ? ` · цель ${raceConfig.targetTime}` : ''}
            </p>
            <div className="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
              Цель: {GOAL_LABEL[goalAnalysis.difficulty]}
            </div>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{goalAnalysis.message}</p>
          </div>

          <div className="garmin-card p-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: READINESS_COLOR[readiness.level] }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Готовность</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{readiness.reason}</p>
            {log.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Форма" value={metrics.ctl} />
                <MiniStat label="Усталость" value={metrics.atl} />
                <MiniStat label="Баланс" value={metrics.tsb} />
              </div>
            )}
          </div>
        </div>
      </div>

      {plan && (
        <button type="button" onClick={() => onOpenWeek(weekNumber)} className="garmin-card flex w-full items-center justify-between p-4 text-left">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Эта неделя</div>
            <div className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {doneThisWeek} из {plan.sessions.length} · {plan.totalHours} ч · TSS {plan.plannedTSS}
            </div>
          </div>
          <i className="fas fa-arrow-right text-sm" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      )}

      <div className="garmin-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Значки</h3>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {badges.filter((badge) => badge.earned).length} / {badges.length}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.earned ? badge.description : badge.requirement}
              className="flex w-24 shrink-0 flex-col items-center rounded-xl px-2 py-3 text-center"
              style={{
                backgroundColor: badge.earned ? 'var(--bg-tertiary)' : 'transparent',
                border: '1px solid var(--border-color)',
                opacity: badge.earned ? 1 : 0.45,
              }}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="mt-1 text-[11px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {log.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            В журнале {log.length} {recordsWord(log.length)}
          </p>
          <button type="button" onClick={onOpenJournal} className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
            Открыть журнал
          </button>
        </div>
      )}

      <SessionDrawer
        session={openSession}
        dateLabel={openSession ? `${DAY_FULL[openSession.day]}, ${dateLabel(openSession, openWeek)}` : ''}
        done={openSession ? isSessionDone(log, openSession.boardId) : false}
        canComplete={openSession ? canCompleteOn(sessionDate(raceConfig.raceDate, raceConfig.weeksToRace, openWeek, openSession.day), today) : false}
        onClose={() => setOpenId(null)}
        onComplete={() => {
          if (!openSession) return;
          onComplete(openSession, openWeek, toLocalIso(sessionDate(raceConfig.raceDate, raceConfig.weeksToRace, openWeek, openSession.day)));
        }}
      />
    </div>
  );
};

function HeroSession({
  session,
  done,
  allDone,
  onOpen,
  onComplete,
}: {
  session: BoardSession;
  done: boolean;
  allDone: boolean;
  onOpen: () => void;
  onComplete: () => void;
}) {
  const look = sessionLook(session);
  return (
    <div className="garmin-card overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: look.color }} />
      <div className="p-5 sm:p-6">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: look.color }}>
          {allDone ? 'День закрыт' : 'Сегодня'} · {look.name}
        </div>
        <button type="button" onClick={onOpen} className="mt-2 block text-left">
          <h3 className="text-xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{session.description}</h3>
        </button>
        <div className="mt-4 flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>{session.duration} мин</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[session.intensity] }} />
            {INTENSITY_LABEL[session.intensity]}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{session.targetPace}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {done ? (
            <div className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: 'rgba(0, 200, 83, 0.12)', color: '#00a844' }}>
              <i className="fas fa-check" />
              В журнале
            </div>
          ) : (
            <button type="button" onClick={onComplete} className="garmin-btn">
              Выполнено
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            Разобрать тренировку
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanWaitCard({
  startLabel,
  upcoming,
  onOpen,
}: {
  startLabel: string;
  upcoming: { session: BoardSession; week: number } | null;
  onOpen?: () => void;
}) {
  const look = upcoming ? sessionLook(upcoming.session) : null;
  return (
    <div className="garmin-card p-5 sm:p-6">
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>До старта плана</div>
      <h3 className="mt-2 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Первая неделя начнётся {startLabel}</h3>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Сейчас в календаре ещё нет тренировок этого цикла. Ближайшая сессия откроется в панели.
      </p>
      {upcoming && look && (
        <button type="button" onClick={onOpen} className="mt-5 w-full rounded-xl p-4 text-left" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{DAY_FULL[upcoming.session.day]}</div>
          <div className="mt-1 text-sm font-semibold" style={{ color: look.color }}>{look.name}</div>
          <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{upcoming.session.description}</div>
        </button>
      )}
    </div>
  );
}

function RestCard({
  upcoming,
  onOpen,
}: {
  upcoming: { session: BoardSession; week: number } | null;
  onOpen?: () => void;
}) {
  const look = upcoming ? sessionLook(upcoming.session) : null;
  return (
    <div className="garmin-card p-5 sm:p-6">
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Сегодня</div>
      <h3 className="mt-2 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>День отдыха</h3>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        В плане на этот день нет тренировок. Восстановление тоже часть подготовки.
      </p>
      {upcoming && look && (
        <button type="button" onClick={onOpen} className="mt-5 w-full rounded-xl p-4 text-left" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Дальше · {DAY_FULL[upcoming.session.day]}</div>
          <div className="mt-1 text-sm font-semibold" style={{ color: look.color }}>{look.name}</div>
          <div className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{upcoming.session.description}</div>
        </button>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg px-2 py-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
    </div>
  );
}

function recordsWord(count: number): string {
  const abs = count % 100;
  const last = count % 10;
  if (abs > 10 && abs < 20) return 'записей';
  if (last === 1) return 'запись';
  if (last >= 2 && last <= 4) return 'записи';
  return 'записей';
}

function findUpcoming(
  plans: BoardWeek[],
  weekNumber: number,
  dayIndex: number,
  raceConfig: RaceConfig,
): { session: BoardSession; week: number } | null {
  for (let week = weekNumber; week <= raceConfig.weeksToRace; week++) {
    const sessions = plans[week - 1]?.sessions ?? [];
    const next = sessions.find((session) => week > weekNumber || session.day > dayIndex);
    if (next) return { session: next, week };
  }
  return null;
}

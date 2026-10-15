import type { Intensity, SessionType, Sport, TrainingLogEntry, TrainingSession, WeekPlan } from '../types';

export interface BoardSession extends TrainingSession {
  boardId: string;
}

export interface BoardWeek extends Omit<WeekPlan, 'sessions'> {
  sessions: BoardSession[];
}

export const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const DAY_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export const INTENSITY_LABEL: Record<Intensity, string> = {
  recovery: 'Восстановление',
  easy: 'Лёгкая',
  moderate: 'Умеренная',
  hard: 'Высокая',
};

export const INTENSITY_COLOR: Record<Intensity, string> = {
  recovery: '#00a4e4',
  easy: '#00c853',
  moderate: '#ff9800',
  hard: '#f44336',
};

export const PHASE_COLOR: Record<string, string> = {
  'Базовый период': '#0077B6',
  'Строительный период': '#2D6A4F',
  'Специальный период': '#E85D04',
  'Пиковый период': '#C1121F',
  'Подводка (Taper)': '#7B2CBF',
};

const SPORT_LOOK: Record<Sport, { name: string; color: string }> = {
  swim: { name: 'Плавание', color: '#0077B6' },
  bike: { name: 'Велосипед', color: '#2D6A4F' },
  run: { name: 'Бег', color: '#E85D04' },
};

const TYPE_LOOK: Partial<Record<SessionType, { name: string; color: string }>> = {
  strength: { name: 'Силовая', color: '#7B2CBF' },
  core: { name: 'Кор', color: '#3A0CA3' },
  stretch: { name: 'Растяжка', color: '#F72585' },
};

export function sessionLook(session: TrainingSession): { name: string; color: string } {
  if (session.type === 'brick') {
    return {
      name: session.sport === 'run' ? 'Брик · вело → бег' : 'Брик · плавание → вело',
      color: '#E85D04',
    };
  }
  return TYPE_LOOK[session.type] ?? SPORT_LOOK[session.sport];
}

export function estimateTss(duration: number, intensity: Intensity): number {
  const factor: Record<Intensity, number> = { recovery: 0.4, easy: 0.6, moderate: 0.8, hard: 1.0 };
  const k = factor[intensity];
  return Math.round((duration / 60) * k * k * 100);
}

export function buildBoard(plans: WeekPlan[], dayOverrides: Record<string, number>): BoardWeek[] {
  return plans.map((plan) => {
    const counts: Record<string, number> = {};
    const sessions = plan.sessions.map((session) => {
      const n = (counts[session.id] ?? 0) + 1;
      counts[session.id] = n;
      const boardId = `${plan.weekNumber}:${session.id}:${n}`;
      const moved = dayOverrides[boardId];
      return { ...session, boardId, day: moved ?? session.day };
    });
    sessions.sort((a, b) => a.day - b.day || b.duration - a.duration);
    return { ...plan, sessions };
  });
}

export function isSessionDone(log: TrainingLogEntry[], boardId: string): boolean {
  return log.some((entry) => entry.sessionId === boardId);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function mondayIndex(date: Date): number {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function raceMonday(raceDate: string): Date {
  const race = parseLocalDate(raceDate);
  const monday = new Date(race);
  monday.setDate(race.getDate() - mondayIndex(race));
  return monday;
}

export function weekMonday(raceDate: string, weeksToRace: number, weekNumber: number): Date {
  const monday = raceMonday(raceDate);
  monday.setDate(monday.getDate() - (weeksToRace - weekNumber) * 7);
  return monday;
}

export function currentPlanWeek(raceDate: string, weeksToRace: number, today = new Date()): number {
  return planTimeline(raceDate, weeksToRace, today).weekNumber;
}

export function planTimeline(raceDate: string, weeksToRace: number, today = new Date()): {
  status: 'before' | 'during' | 'after';
  weekNumber: number;
  planStart: Date;
} {
  const planStart = startOfDay(weekMonday(raceDate, weeksToRace, 1));
  const race = startOfDay(parseLocalDate(raceDate));
  const todayStart = startOfDay(today);
  const todayMon = new Date(todayStart);
  todayMon.setDate(todayStart.getDate() - mondayIndex(today));
  const diffWeeks = Math.round((raceMonday(raceDate).getTime() - todayMon.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const raw = weeksToRace - diffWeeks;
  let status: 'before' | 'during' | 'after' = 'during';
  if (todayStart.getTime() < planStart.getTime()) status = 'before';
  else if (todayStart.getTime() > race.getTime()) status = 'after';
  return {
    status,
    weekNumber: Math.min(Math.max(raw, 1), Math.max(weeksToRace, 1)),
    planStart,
  };
}

export function defaultRaceDate(weeks: number, today = new Date()): string {
  const monday = startOfDay(today);
  monday.setDate(monday.getDate() - mondayIndex(today));
  const race = new Date(monday);
  race.setDate(monday.getDate() + (Math.max(weeks, 1) - 1) * 7 + 6);
  return toLocalIso(race);
}

export function canCompleteOn(sessionDay: Date, today = new Date()): boolean {
  return startOfDay(sessionDay).getTime() <= startOfDay(today).getTime();
}

export function sessionDate(raceDate: string, weeksToRace: number, weekNumber: number, dayIndex: number): Date {
  const date = weekMonday(raceDate, weeksToRace, weekNumber);
  date.setDate(date.getDate() + dayIndex);
  return date;
}

export function daysUntil(raceDate: string, today = new Date()): number {
  const race = startOfDay(parseLocalDate(raceDate));
  return Math.round((race.getTime() - startOfDay(today).getTime()) / (24 * 60 * 60 * 1000));
}

export function daysWord(count: number): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'дней';
  if (last === 1) return 'день';
  if (last >= 2 && last <= 4) return 'дня';
  return 'дней';
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export interface WorkoutSection {
  title: string;
  body: string;
}

export function splitWorkout(details: string): WorkoutSection[] {
  const text = details.trim();
  const parts = text.split(/(Разминка|Основная(?:\s+часть)?|Заминка|Упражнения|Drills)\s*:?\s*/i);
  if (parts.length === 1) return [{ title: 'Как выполнять', body: text }];

  const sections: WorkoutSection[] = [];
  const preamble = parts[0].trim();
  if (preamble) sections.push({ title: 'О тренировке', body: preamble });

  for (let i = 1; i < parts.length; i += 2) {
    const raw = parts[i] || '';
    const body = (parts[i + 1] || '').trim().replace(/\s+/g, ' ');
    if (!body) continue;
    const lower = raw.toLowerCase();
    let title = 'Основная часть';
    if (lower.startsWith('разминка')) title = 'Разминка';
    else if (lower.startsWith('заминка')) title = 'Заминка';
    else if (lower.startsWith('упражнения') || lower === 'drills') title = 'Техника';
    sections.push({ title, body });
  }

  return sections.length > 0 ? sections : [{ title: 'Как выполнять', body: text }];
}

export function phaseColor(phase: string): string {
  return PHASE_COLOR[phase] ?? '#007CC3';
}

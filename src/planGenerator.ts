import { AthleteProfile, RaceConfig, TrainingSession, WeekPlan, Distance, Level, Sport, Intensity, SessionType } from './types';

function getPhase(weekNumber: number, totalWeeks: number): string {
  const progress = weekNumber / totalWeeks;
  if (progress <= 0.25) return 'Базовый период';
  if (progress <= 0.5) return 'Строительный период';
  if (progress <= 0.75) return 'Специальный период';
  if (progress <= 0.9) return 'Пиковый период';
  return 'Подводка (Taper)';
}

function getPhaseMultiplier(weekNumber: number, totalWeeks: number): number {
  const progress = weekNumber / totalWeeks;
  if (progress <= 0.25) return 0.6 + (progress / 0.25) * 0.2;
  if (progress <= 0.5) return 0.8 + ((progress - 0.25) / 0.25) * 0.2;
  if (progress <= 0.75) return 1.0;
  if (progress <= 0.9) return 1.0;
  return 0.7;
}

function getDistanceBaseHours(distance: Distance): { swim: number; bike: number; run: number } {
  switch (distance) {
    case 'sprint': return { swim: 2, bike: 3, run: 2.5 };
    case 'olympic': return { swim: 3, bike: 5, run: 3.5 };
    case 'half_iron': return { swim: 3.5, bike: 7, run: 4.5 };
    case 'ironman': return { swim: 5, bike: 10, run: 6 };
  }
}

function getLevelMultiplier(level: Level): number {
  switch (level) {
    case 'beginner': return 0.7;
    case 'intermediate': return 1.0;
    case 'advanced': return 1.3;
  }
}

function generateSwimSession(day: number, intensity: Intensity, type: SessionType, duration: number, weekNum: number): TrainingSession {
  const descriptions: Record<SessionType, string> = {
    interval: `Интервальное плавание: ${Math.round(duration * 0.6)}м работа + восстановление`,
    tempo: `Темповое плавание: непрерывное плавание в аэробном пороге`,
    long: `Длительная тренировка: непрерывное плавание с акцентом на технику`,
    recovery: `Восстановительное плавание: лёгкие упражнения на технику`,
    technique: `Техническая тренировка: drills, работа над гребком и дыханием`,
    brick: `Комплексная тренировка: плавание + переход`,
  };

  const details: Record<SessionType, string> = {
    interval: `Разминка: 200м вольным. Основная: 8x100м на 80% с отдыхом 20сек. Заминка: 200м спокойно.`,
    tempo: `Разминка: 300м. Основная: 3x400м в темпе с отдыхом 30сек. Заминка: 200м.`,
    long: `Разминка: 200м. Основная: непрерывное плавание ${Math.round(duration * 0.7)}м. Заминка: 200м.`,
    recovery: `Разминка: 200м. Упражнения: 8x50м drills. Заминка: 200м спокойно.`,
    technique: `Разминка: 200м. Drills: catch-up, fingertip drag, single arm. Основная: 6x100м с фокусом на технику.`,
    brick: `Разминка: 200м. Основная: 4x200м с ускорениями. Переход к велосипеду.`,
  };

  return {
    id: `swim-${weekNum}-${day}`,
    day,
    sport: 'swim',
    type,
    intensity,
    duration,
    description: descriptions[type],
    details: details[type],
  };
}

function generateBikeSession(day: number, intensity: Intensity, type: SessionType, duration: number, weekNum: number): TrainingSession {
  const descriptions: Record<SessionType, string> = {
    interval: `Интервалы на велосипеде: ${Math.floor(duration / 60)}ч работа на высокой мощности`,
    tempo: `Темповая поездка: устойчивый темп в зоне 3-4`,
    long: `Длительная поездка: аэробная база, ${Math.round(duration / 60 * 30)}км`,
    recovery: `Восстановительная поездка: лёгкий крутинг, зона 1-2`,
    technique: `Техническая работа: cadence drills, работа на холмах`,
    brick: `Велосипед + переход к бегу: ${Math.round(duration * 0.8)}мин вело + ${Math.round(duration * 0.2)}мин бег`,
  };

  const details: Record<SessionType, string> = {
    interval: `Разминка 15мин. Основная: 5x5мин на 90% FTP, отдых 3мин. Заминка 15мин.`,
    tempo: `Разминка 15мин. Основная: 2x20мин в темпе (зона 3-4), отдых 5мин. Заминка 15мин.`,
    long: `Разминка 15мин. Основная: ровный темп зона 2, питание каждые 20мин. Заминка 10мин.`,
    recovery: `Лёгкий крутинг 60мин, зона 1-2. Каденс 85-95 об/мин.`,
    technique: `Разминка 10мин. Single leg drills 4x2мин. Hill repeats 6x2мин. Заминка 10мин.`,
    brick: `Вело: 40мин зона 3. Переход: бег 10мин зона 2-3 для адаптации ног.`,
  };

  return {
    id: `bike-${weekNum}-${day}`,
    day,
    sport: 'bike',
    type,
    intensity,
    duration,
    description: descriptions[type],
    details: details[type],
  };
}

function generateRunSession(day: number, intensity: Intensity, type: SessionType, duration: number, weekNum: number): TrainingSession {
  const descriptions: Record<SessionType, string> = {
    interval: `Интервальный бег: ускорения с восстановлением`,
    tempo: `Темповой бег: устойчивый темп на аэробном пороге`,
    long: `Длительный бег: ${Math.round(duration / 60 * 10)}км в аэробной зоне`,
    recovery: `Восстановительный бег: очень лёгкий темп, разговорный`,
    technique: `Технический бег: drills, ускорения, работа над каденсом`,
    brick: `Бег после велосипеда: адаптация ног к беговому шагу`,
  };

  const details: Record<SessionType, string> = {
    interval: `Разминка 10мин. Основная: 8x400м на 85-90% с отдыхом 90сек. Заминка 10мин.`,
    tempo: `Разминка 10мин. Основная: 2x15мин в темпе, отдых 3мин. Заминка 10мин.`,
    long: `Разминка 5мин. Основная: ровный бег зона 2, питание каждые 30мин. Заминка 5мин.`,
    recovery: `Лёгкий бег 30-40мин, зона 1. Каденс 170-180 шагов/мин.`,
    technique: `Разминка 10мин. A-скок, B-скок, захлёст. 6x100м ускорения. Заминка 10мин.`,
    brick: `После велосипеда: бег 15-20мин. Фокус на быстрый переход на беговой шаг. Зона 2-3.`,
  };

  return {
    id: `run-${weekNum}-${day}`,
    day,
    sport: 'run',
    type,
    intensity,
    duration,
    description: descriptions[type],
    details: details[type],
  };
}

export function generateWeekPlan(
  profile: AthleteProfile,
  raceConfig: RaceConfig,
  weekNumber: number
): WeekPlan {
  const phase = getPhase(weekNumber, raceConfig.weeksToRace);
  const phaseMultiplier = getPhaseMultiplier(weekNumber, raceConfig.weeksToRace);
  const levelMultiplier = getLevelMultiplier(profile.level);
  const baseHours = getDistanceBaseHours(raceConfig.distance);

  // Adjust based on available hours
  const totalBaseHours = baseHours.swim + baseHours.bike + baseHours.run;
  const hourRatio = profile.weeklyHours / totalBaseHours;

  const swimHours = baseHours.swim * hourRatio * phaseMultiplier * levelMultiplier;
  const bikeHours = baseHours.bike * hourRatio * phaseMultiplier * levelMultiplier;
  const runHours = baseHours.run * hourRatio * phaseMultiplier * levelMultiplier;

  const sessions: TrainingSession[] = [];
  const days = profile.trainingDays;

  // Swimming: 2-3 sessions per week
  const swimSessions = days >= 5 ? 3 : 2;
  const swimDuration = Math.round((swimHours * 60) / swimSessions);

  if (swimSessions >= 2) {
    sessions.push(generateSwimSession(0, 'moderate', 'interval', swimDuration, weekNumber));
    sessions.push(generateSwimSession(2, 'easy', 'technique', Math.round(swimDuration * 0.8), weekNumber));
  }
  if (swimSessions >= 3) {
    sessions.push(generateSwimSession(4, 'moderate', 'long', Math.round(swimDuration * 1.2), weekNumber));
  }

  // Cycling: 2-3 sessions per week
  const bikeSessions = days >= 5 ? 3 : 2;
  const bikeDuration = Math.round((bikeHours * 60) / bikeSessions);

  sessions.push(generateBikeSession(1, 'hard', 'interval', bikeDuration, weekNumber));
  if (bikeSessions >= 2) {
    sessions.push(generateBikeSession(3, 'easy', 'long', Math.round(bikeDuration * 1.5), weekNumber));
  }
  if (bikeSessions >= 3) {
    sessions.push(generateBikeSession(5, 'moderate', 'brick', Math.round(bikeDuration * 0.8), weekNumber));
  }

  // Running: 3-4 sessions per week
  const runSessions = days >= 6 ? 4 : 3;
  const runDuration = Math.round((runHours * 60) / runSessions);

  sessions.push(generateRunSession(0, 'hard', 'interval', runDuration, weekNumber));
  sessions.push(generateRunSession(2, 'easy', 'recovery', Math.round(runDuration * 0.7), weekNumber));
  if (runSessions >= 3) {
    sessions.push(generateRunSession(4, 'moderate', 'tempo', Math.round(runDuration * 1.1), weekNumber));
  }
  if (runSessions >= 4) {
    sessions.push(generateRunSession(6, 'easy', 'long', Math.round(runDuration * 1.8), weekNumber));
  }

  // Add brick session if advanced and enough days
  if (profile.level === 'advanced' && days >= 5) {
    sessions.push(generateRunSession(3, 'moderate', 'brick', Math.round(runDuration * 0.8), weekNumber));
  }

  // Sort by day
  sessions.sort((a, b) => a.day - b.day);

  // Calculate volumes
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const swimVolume = sessions.filter(s => s.sport === 'swim').reduce((sum, s) => sum + s.duration, 0);
  const bikeVolume = sessions.filter(s => s.sport === 'bike').reduce((sum, s) => sum + s.duration, 0);
  const runVolume = sessions.filter(s => s.sport === 'run').reduce((sum, s) => sum + s.duration, 0);

  return {
    weekNumber,
    phase,
    sessions,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    swimVolume: Math.round(swimVolume / 60 * 10) / 10,
    bikeVolume: Math.round(bikeVolume / 60 * 10) / 10,
    runVolume: Math.round(runVolume / 60 * 10) / 10,
  };
}

export function generateFullPlan(profile: AthleteProfile, raceConfig: RaceConfig): WeekPlan[] {
  const plans: WeekPlan[] = [];
  for (let i = 1; i <= raceConfig.weeksToRace; i++) {
    plans.push(generateWeekPlan(profile, raceConfig, i));
  }
  return plans;
}

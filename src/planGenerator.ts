import { AthleteProfile, RaceConfig, TrainingSession, WeekPlan, Distance, Level, Sport, Intensity, SessionType, TrainingLogEntry, FitnessMetrics } from './types';

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

function getTargetHR(intensity: Intensity, profile: AthleteProfile): string {
  const z = profile.hrZones;
  switch (intensity) {
    case 'recovery': return `${z.zone1.min}-${z.zone1.max} уд/мин (Зона 1)`;
    case 'easy': return `${z.zone2.min}-${z.zone2.max} уд/мин (Зона 2)`;
    case 'moderate': return `${z.zone3.min}-${z.zone3.max} уд/мин (Зона 3)`;
    case 'hard': return `${z.zone4.min}-${z.zone5.max} уд/мин (Зона 4-5)`;
  }
}

function getTargetPace(sport: Sport, intensity: Intensity, profile: AthleteProfile): string {
  const pz = profile.paceZones;
  if (sport === 'swim') {
    const base = pz.swimCSS;
    switch (intensity) {
      case 'recovery': return `+15сек к CSS (${base + 15}сек/100м)`;
      case 'easy': return `+10сек к CSS (${base + 10}сек/100м)`;
      case 'moderate': return `CSS темп (${base}сек/100м)`;
      case 'hard': return `-5сек от CSS (${base - 5}сек/100м)`;
    }
  }
  if (sport === 'bike') {
    const ftp = pz.bikeFTP;
    switch (intensity) {
      case 'recovery': return `${Math.round(ftp * 0.50)}-${Math.round(ftp * 0.55)}W (50-55% FTP)`;
      case 'easy': return `${Math.round(ftp * 0.56)}-${Math.round(ftp * 0.75)}W (56-75% FTP)`;
      case 'moderate': return `${Math.round(ftp * 0.76)}-${Math.round(ftp * 0.90)}W (76-90% FTP)`;
      case 'hard': return `${Math.round(ftp * 0.91)}-${Math.round(ftp * 1.05)}W (91-105% FTP)`;
    }
  }
  if (sport === 'run') {
    switch (intensity) {
      case 'recovery': return `Легче ${pz.runEasyPace} мин/км`;
      case 'easy': return `${pz.runEasyPace} мин/км`;
      case 'moderate': return `${pz.runTempoPace} мин/км`;
      case 'hard': return `${pz.runThresholdPace} мин/км и быстрее`;
    }
  }
  return '';
}

function isSportAllowed(sport: Sport, dayIndex: number, profile: AthleteProfile): boolean {
  const prefs = profile.dayPreferences[dayIndex];
  // Если предпочтения не заданы или пустые — этот день ОТДЫХА
  if (!prefs || prefs.length === 0) return false;
  return prefs.includes(sport);
}

/**
 * Находит дни для размещения тренировок данного вида спорта.
 * Логика:
 * - Дни, где пользователь отметил этот спорт → можно ставить
 * - Дни, где отмечены другие виды спорта → нельзя
 * - Дни без отметок → день отдыха, нельзя
 */
function findDaysForSport(
  sport: Sport,
  neededCount: number,
  profile: AthleteProfile,
  occupiedDays: Map<number, number> // day -> count of sessions already placed
): number[] {
  const MAX_PER_DAY = 2; // не более 2 тренировок в день

  // Находим все дни, где пользователь явно указал этот вид спорта
  const allowedDays: number[] = [];
  for (let d = 0; d < 7; d++) {
    const prefs = profile.dayPreferences[d];
    if (prefs && prefs.length > 0 && prefs.includes(sport)) {
      allowedDays.push(d);
    }
  }

  // Фильтруем по загруженности дня
  const available = allowedDays.filter(d => (occupiedDays.get(d) || 0) < MAX_PER_DAY);

  // Берём нужное количество, равномерно распределяя
  if (available.length >= neededCount) {
    return distributeEvenly(available, neededCount);
  }

  // Если не хватает — берём все доступные (пользователь получит меньше тренировок, чем запланировано)
  return available;
}

/**
 * Равномерно распределяет N тренировок по доступным дням.
 * Выбирает дни, максимально удалённые друг от друга.
 */
function distributeEvenly(days: number[], count: number): number[] {
  if (count >= days.length) return days;
  if (count <= 0) return [];
  if (count === 1) return [days[Math.floor(days.length / 2)]];

  const step = days.length / count;
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step);
    result.push(days[Math.min(index, days.length - 1)]);
  }
  return result;
}

function calculateTSS(duration: number, intensity: Intensity): number {
  const intFactor: Record<Intensity, number> = {
    recovery: 0.4,
    easy: 0.6,
    moderate: 0.8,
    hard: 1.0,
  };
  return Math.round((duration / 60) * intFactor[intensity] * intFactor[intensity] * 100);
}

function generateSwimSession(day: number, intensity: Intensity, type: SessionType, duration: number, weekNum: number, profile: AthleteProfile): TrainingSession {
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
    targetHR: getTargetHR(intensity, profile),
    targetPace: getTargetPace('swim', intensity, profile),
    description: descriptions[type],
    details: details[type],
    completed: false,
  };
}

function generateBikeSession(day: number, intensity: Intensity, type: SessionType, duration: number, weekNum: number, profile: AthleteProfile): TrainingSession {
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
    targetHR: getTargetHR(intensity, profile),
    targetPace: getTargetPace('bike', intensity, profile),
    description: descriptions[type],
    details: details[type],
    completed: false,
  };
}

function generateRunSession(day: number, intensity: Intensity, type: SessionType, duration: number, weekNum: number, profile: AthleteProfile): TrainingSession {
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
    targetHR: getTargetHR(intensity, profile),
    targetPace: getTargetPace('run', intensity, profile),
    description: descriptions[type],
    details: details[type],
    completed: false,
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

  const totalBaseHours = baseHours.swim + baseHours.bike + baseHours.run;
  const hourRatio = profile.weeklyHours / totalBaseHours;

  const swimHours = baseHours.swim * hourRatio * phaseMultiplier * levelMultiplier;
  const bikeHours = baseHours.bike * hourRatio * phaseMultiplier * levelMultiplier;
  const runHours = baseHours.run * hourRatio * phaseMultiplier * levelMultiplier;

  const sessions: TrainingSession[] = [];
  const days = profile.trainingDays;

  // Track how many sessions are placed on each day (to avoid overloading)
  const occupiedDays = new Map<number, number>();
  const addOccupied = (day: number) => {
    occupiedDays.set(day, (occupiedDays.get(day) || 0) + 1);
  };

  // === SWIMMING: 2-3 sessions per week ===
  const swimSessions = days >= 5 ? 3 : 2;
  const swimDuration = Math.round((swimHours * 60) / swimSessions);
  const swimDays = findDaysForSport('swim', swimSessions, profile, occupiedDays);

  if (swimDays.length >= 1) {
    sessions.push(generateSwimSession(swimDays[0], 'moderate', 'interval', swimDuration, weekNumber, profile));
    addOccupied(swimDays[0]);
  }
  if (swimDays.length >= 2) {
    sessions.push(generateSwimSession(swimDays[1], 'easy', 'technique', Math.round(swimDuration * 0.8), weekNumber, profile));
    addOccupied(swimDays[1]);
  }
  if (swimDays.length >= 3) {
    sessions.push(generateSwimSession(swimDays[2], 'moderate', 'long', Math.round(swimDuration * 1.2), weekNumber, profile));
    addOccupied(swimDays[2]);
  }

  // === CYCLING: 2-3 sessions per week ===
  const bikeSessions = days >= 5 ? 3 : 2;
  const bikeDuration = Math.round((bikeHours * 60) / bikeSessions);
  const bikeDays = findDaysForSport('bike', bikeSessions, profile, occupiedDays);

  if (bikeDays.length >= 1) {
    sessions.push(generateBikeSession(bikeDays[0], 'hard', 'interval', bikeDuration, weekNumber, profile));
    addOccupied(bikeDays[0]);
  }
  if (bikeDays.length >= 2) {
    sessions.push(generateBikeSession(bikeDays[1], 'easy', 'long', Math.round(bikeDuration * 1.5), weekNumber, profile));
    addOccupied(bikeDays[1]);
  }
  if (bikeDays.length >= 3) {
    sessions.push(generateBikeSession(bikeDays[2], 'moderate', 'brick', Math.round(bikeDuration * 0.8), weekNumber, profile));
    addOccupied(bikeDays[2]);
  }

  // === RUNNING: 3-4 sessions per week ===
  const runSessions = days >= 6 ? 4 : 3;
  const runDuration = Math.round((runHours * 60) / runSessions);
  const runDays = findDaysForSport('run', runSessions, profile, occupiedDays);

  if (runDays.length >= 1) {
    sessions.push(generateRunSession(runDays[0], 'hard', 'interval', runDuration, weekNumber, profile));
    addOccupied(runDays[0]);
  }
  if (runDays.length >= 2) {
    sessions.push(generateRunSession(runDays[1], 'easy', 'recovery', Math.round(runDuration * 0.7), weekNumber, profile));
    addOccupied(runDays[1]);
  }
  if (runDays.length >= 3) {
    sessions.push(generateRunSession(runDays[2], 'moderate', 'tempo', Math.round(runDuration * 1.1), weekNumber, profile));
    addOccupied(runDays[2]);
  }
  if (runDays.length >= 4) {
    sessions.push(generateRunSession(runDays[3], 'easy', 'long', Math.round(runDuration * 1.8), weekNumber, profile));
    addOccupied(runDays[3]);
  }

  // === BRICK session for advanced athletes ===
  if (profile.level === 'advanced' && days >= 5) {
    // Find a day where both bike and run are allowed
    const brickCandidates: number[] = [];
    for (let d = 0; d < 7; d++) {
      if (isSportAllowed('run', d, profile) && isSportAllowed('bike', d, profile)) {
        brickCandidates.push(d);
      }
    }
    // Prefer days that already have a bike session (to combine)
    const brickDay = brickCandidates.find(d => sessions.some(s => s.day === d && s.sport === 'bike'))
      ?? brickCandidates[0];
    if (brickDay !== undefined) {
      sessions.push(generateRunSession(brickDay, 'moderate', 'brick', Math.round(runDuration * 0.8), weekNumber, profile));
    }
  }

  // Sort by day
  sessions.sort((a, b) => a.day - b.day);

  // Calculate volumes
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const swimVolume = sessions.filter(s => s.sport === 'swim').reduce((sum, s) => sum + s.duration, 0);
  const bikeVolume = sessions.filter(s => s.sport === 'bike').reduce((sum, s) => sum + s.duration, 0);
  const runVolume = sessions.filter(s => s.sport === 'run').reduce((sum, s) => sum + s.duration, 0);
  const plannedTSS = sessions.reduce((sum, s) => sum + calculateTSS(s.duration, s.intensity), 0);

  return {
    weekNumber,
    phase,
    sessions,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    swimVolume: Math.round(swimVolume / 60 * 10) / 10,
    bikeVolume: Math.round(bikeVolume / 60 * 10) / 10,
    runVolume: Math.round(runVolume / 60 * 10) / 10,
    plannedTSS,
  };
}

export function generateFullPlan(profile: AthleteProfile, raceConfig: RaceConfig): WeekPlan[] {
  const plans: WeekPlan[] = [];
  for (let i = 1; i <= raceConfig.weeksToRace; i++) {
    plans.push(generateWeekPlan(profile, raceConfig, i));
  }
  return plans;
}

export function calculateFitnessMetrics(log: TrainingLogEntry[]): FitnessMetrics {
  if (log.length === 0) return { ctl: 0, atl: 0, tsb: 0, rampRate: 0 };

  // Sort by date
  const sorted = [...log].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Simple exponential moving average
  const ctlDecay = 42; // 42-day time constant
  const atlDecay = 7;  // 7-day time constant

  const now = new Date();
  let ctl = 0;
  let atl = 0;

  sorted.forEach(entry => {
    const daysAgo = (now.getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24);
    ctl += entry.tss * Math.exp(-daysAgo / ctlDecay);
    atl += entry.tss * Math.exp(-daysAgo / atlDecay);
  });

  ctl = Math.round(ctl);
  atl = Math.round(atl);
  const tsb = ctl - atl;

  // Ramp rate: CTL change over last 4 weeks
  const fourWeeksAgo = sorted.filter(e => {
    const daysAgo = (now.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 28;
  });
  const rampRate = fourWeeksAgo.length > 0 ? Math.round((ctl / 4) * 10) / 10 : 0;

  return { ctl, atl, tsb, rampRate };
}

export function getReadiness(log: TrainingLogEntry[]): { level: 'green' | 'yellow' | 'red'; reason: string } {
  if (log.length === 0) return { level: 'green', reason: 'Нет данных — предполагаем готовность' };

  const recent = log.slice(-7);
  const avgSleep = recent.reduce((s, e) => s + e.sleepHours, 0) / recent.length;
  const avgSoreness = recent.reduce((s, e) => s + e.muscleSoreness, 0) / recent.length;
  const avgMood = recent.reduce((s, e) => s + e.mood, 0) / recent.length;
  const metrics = calculateFitnessMetrics(log);

  if (avgSleep < 6 || avgSoreness > 3.5 || metrics.tsb < -30) {
    return { level: 'red', reason: 'Низкое восстановление. Рекомендуется отдых или лёгкая тренировка.' };
  }
  if (avgSleep < 7 || avgSoreness > 2.5 || avgMood < 3 || metrics.tsb < -15) {
    return { level: 'yellow', reason: 'Умеренная усталость. Можно тренироваться с осторожностью.' };
  }
  return { level: 'green', reason: 'Отличная форма! Можно выполнять план в полном объёме.' };
}

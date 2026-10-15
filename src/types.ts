export type Distance = 'sprint' | 'olympic' | 'half_iron' | 'ironman';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Sport = 'swim' | 'bike' | 'run';
export type Intensity = 'easy' | 'moderate' | 'hard' | 'recovery';
export type SessionType = 'interval' | 'tempo' | 'long' | 'recovery' | 'brick' | 'technique' | 'strength' | 'core' | 'stretch' | 'swim_brick' | 'bike_run_brick';
export type ReadinessLevel = 'green' | 'yellow' | 'red';
export type Tab = 'today' | 'week' | 'profile' | 'journal' | 'analytics' | 'nutrition' | 'strength';

export interface HeartRateZones {
  maxHR: number;
  restHR: number;
  zone1: { min: number; max: number; name: string }; // Recovery
  zone2: { min: number; max: number; name: string }; // Aerobic
  zone3: { min: number; max: number; name: string }; // Tempo
  zone4: { min: number; max: number; name: string }; // Threshold
  zone5: { min: number; max: number; name: string }; // VO2max
}

export interface PaceZones {
  runEasyPace: string;   // min/km
  runTempoPace: string;
  runThresholdPace: string;
  bikeFTP: number;       // watts
  swimCSS: number;       // sec/100m
}

export interface DayPreferences {
  [dayIndex: number]: Sport[]; // 0=Mon, 6=Sun — preferred sports for each day
}

export interface HealthRestrictions {
  injuries: string;
  allergies: string;
  notes: string;
}

export interface AthleteProfile {
  name: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  level: Level;
  weeklyHours: number;
  trainingDays: number;
  hrZones: HeartRateZones;
  paceZones: PaceZones;
  currentFitness: {
    cooperTest: number;   // meters in 12 min
    ftp: number;          // watts
    css: number;          // sec/100m
    swim100m: number;     // seconds
  };
  dayPreferences: DayPreferences;
  healthRestrictions: HealthRestrictions;
  goalRace: string;
}

export interface RaceConfig {
  distance: Distance;
  weeksToRace: number;
  raceDate: string;
  targetTime: string; // формат "HH:MM:SS" или "MM:SS"
  targetSwimTime: number; // секунды
  targetBikeTime: number; // секунды
  targetRunTime: number; // секунды
}

export interface TrainingSession {
  id: string;
  day: number;
  sport: Sport;
  type: SessionType;
  intensity: Intensity;
  duration: number;
  targetHR: string;
  targetPace: string;
  description: string;
  details: string;
  completed: boolean;
}

export interface WeekPlan {
  weekNumber: number;
  phase: string;
  sessions: TrainingSession[];
  totalHours: number;
  swimVolume: number;
  bikeVolume: number;
  runVolume: number;
  plannedTSS: number;
}

export interface TrainingLogEntry {
  id: string;
  sessionId: string;
  date: string;
  weekNumber: number;
  sport: Sport;
  plannedDuration: number;
  actualDuration: number;
  distance: number; // km or m for swim
  avgHR: number;
  avgPace: string;
  rpe: number; // 1-10
  calories: number;
  tss: number; // Training Stress Score
  comment: string;
  mood: number; // 1-5
  sleepHours: number;
  sleepQuality: number; // 1-5
  muscleSoreness: number; // 1-5
}

export interface FitnessMetrics {
  ctl: number;  // Chronic Training Load (fitness)
  atl: number;  // Acute Training Load (fatigue)
  tsb: number;  // Training Stress Balance (form)
  rampRate: number; // CTL change per week
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  requirement: string;
}

export interface NutritionPlan {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  hydration: number; // ml
  preWorkout: string;
  duringWorkout: string;
  postWorkout: string;
  raceDayPlan: RaceDayNutrition[];
}

export interface RaceDayNutrition {
  time: string;
  meal: string;
  calories: number;
  notes: string;
}

export const DISTANCE_INFO: Record<Distance, { name: string; swim: string; bike: string; run: string; total: string }> = {
  sprint: { name: 'Спринт', swim: '750м', bike: '20км', run: '5км', total: '~25.75км' },
  olympic: { name: 'Олимпийская', swim: '1.5км', bike: '40км', run: '10км', total: '~51.5км' },
  half_iron: { name: '70.3 (Half Ironman)', swim: '1.9км', bike: '90км', run: '21.1км', total: '113км' },
  ironman: { name: 'IRONMAN', swim: '3.8км', bike: '180км', run: '42.2км', total: '226км' },
};

export const LEVEL_INFO: Record<Level, { name: string; description: string }> = {
  beginner: { name: 'Новичок', description: 'Менее 1 года опыта' },
  intermediate: { name: 'Средний', description: '1-3 года опыта' },
  advanced: { name: 'Продвинутый', description: 'Более 3 лет опыта' },
};

export const MOTIVATIONAL_QUOTES = [
  '«Боль временна. Гордость — навсегда.»',
  '«Единственная плохая тренировка — та, которая не состоялась.»',
  '«Твоё тело может больше, чем думает твой разум.»',
  '«Дисциплина — это мост между целями и достижениями.»',
  '«Каждый шаг приближает тебя к финишу.»',
  '«Не считай дни. Делай дни значимыми.»',
  '«Чемпионы тренируются, когда никто не смотрит.»',
  '«Слабый ум сдаётся за 10 км до финиша. Сильный — за 10 км до старта.»',
  '«Плыви. Крути. Беги. Повтори.»',
  '«Ты не обязан быть великим, чтобы начать. Но ты должен начать, чтобы стать великим.»',
];

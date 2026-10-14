export type Distance = 'sprint' | 'olympic' | 'half_iron' | 'ironman';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Sport = 'swim' | 'bike' | 'run';
export type Intensity = 'easy' | 'moderate' | 'hard' | 'recovery';
export type SessionType = 'interval' | 'tempo' | 'long' | 'recovery' | 'brick' | 'technique';

export interface AthleteProfile {
  name: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  level: Level;
  weeklyHours: number;
  trainingDays: number;
}

export interface RaceConfig {
  distance: Distance;
  weeksToRace: number;
  raceDate: string;
}

export interface TrainingSession {
  id: string;
  day: number; // 0-6 (Mon-Sun)
  sport: Sport;
  type: SessionType;
  intensity: Intensity;
  duration: number; // minutes
  description: string;
  details: string;
}

export interface WeekPlan {
  weekNumber: number;
  phase: string;
  sessions: TrainingSession[];
  totalHours: number;
  swimVolume: number;
  bikeVolume: number;
  runVolume: number;
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

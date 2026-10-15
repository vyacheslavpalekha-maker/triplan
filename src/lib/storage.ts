import type { AthleteProfile, Badge, RaceConfig, TrainingLogEntry } from '../types';

const STORAGE_KEY = 'triplan-v1';

export interface TriPlanState {
  profile: AthleteProfile;
  raceConfig: RaceConfig;
  log: TrainingLogEntry[];
  badges: Badge[];
  dayOverrides: Record<string, number>;
}

export function loadTriPlanState(): Partial<TriPlanState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<TriPlanState>;
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

export function saveTriPlanState(state: TriPlanState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Телефон может отказать в записи, если память переполнена.
  }
}

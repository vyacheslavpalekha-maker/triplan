import { AthleteProfile, RaceConfig, Distance } from './types';

// Дистанции в метрах/километрах
const DISTANCES: Record<Distance, { swim: number; bike: number; run: number }> = {
  sprint: { swim: 0.75, bike: 20, run: 5 },
  olympic: { swim: 1.5, bike: 40, run: 10 },
  half_iron: { swim: 1.9, bike: 90, run: 21.1 },
  ironman: { swim: 3.8, bike: 180, run: 42.2 },
};

// Реалистичное время для разных уровней (в секундах)
const REALISTIC_TIMES: Record<Distance, Record<string, { swim: number; bike: number; run: number; total: number }>> = {
  sprint: {
    beginner: { swim: 900, bike: 2700, run: 1800, total: 5400 }, // 1:30:00
    intermediate: { swim: 720, bike: 2160, run: 1500, total: 4380 }, // 1:13:00
    advanced: { swim: 600, bike: 1800, run: 1200, total: 3600 }, // 1:00:00
  },
  olympic: {
    beginner: { swim: 1800, bike: 5400, run: 3600, total: 10800 }, // 3:00:00
    intermediate: { swim: 1500, bike: 4500, run: 3000, total: 9000 }, // 2:30:00
    advanced: { swim: 1200, bike: 3600, run: 2400, total: 7200 }, // 2:00:00
  },
  half_iron: {
    beginner: { swim: 2700, bike: 10800, run: 7200, total: 20700 }, // 5:45:00
    intermediate: { swim: 2400, bike: 9000, run: 5400, total: 16800 }, // 4:40:00
    advanced: { swim: 1800, bike: 7200, run: 4200, total: 13200 }, // 3:40:00
  },
  ironman: {
    beginner: { swim: 5400, bike: 21600, run: 14400, total: 41400 }, // 11:30:00
    intermediate: { swim: 4200, bike: 18000, run: 10800, total: 33000 }, // 9:10:00
    advanced: { swim: 3600, bike: 14400, run: 9000, total: 27000 }, // 7:30:00
  },
};

export function calculateTargetTimes(targetTime: string, distance: Distance): {
  swim: number;
  bike: number;
  run: number;
  total: number;
} {
  const parts = targetTime.split(':').map(Number);
  let totalSeconds = 0;
  
  if (parts.length === 3) {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    totalSeconds = parts[0] * 60 + parts[1];
  }

  // Пропорциональное распределение времени
  const realistic = REALISTIC_TIMES[distance].intermediate;
  const ratio = totalSeconds / realistic.total;

  return {
    swim: Math.round(realistic.swim * ratio),
    bike: Math.round(realistic.bike * ratio),
    run: Math.round(realistic.run * ratio),
    total: totalSeconds,
  };
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function calculatePace(distanceKm: number, timeSeconds: number): string {
  const paceSeconds = timeSeconds / distanceKm;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function analyzeGoalRealism(
  profile: AthleteProfile,
  raceConfig: RaceConfig
): {
  isRealistic: boolean;
  difficulty: 'easy' | 'realistic' | 'challenging' | 'unrealistic';
  message: string;
  suggestions: string[];
} {
  const targetTimes = calculateTargetTimes(raceConfig.targetTime, raceConfig.distance);
  const distances = DISTANCES[raceConfig.distance];
  const level = profile.level;
  
  // Рассчитываем целевые темпы
  const targetSwimPace = targetTimes.swim / distances.swim; // сек/км
  const targetBikeSpeed = (distances.bike / targetTimes.bike) * 3600; // км/ч
  const targetRunPace = targetTimes.run / distances.run; // сек/км

  // Сравниваем с текущей формой
  const currentSwimPace = profile.currentFitness.swim100m * 10; // сек/км
  const currentRunPace = profile.currentFitness.cooperTest > 0 
    ? (12 * 60) / (profile.currentFitness.cooperTest / 1000) // сек/км из теста Купера
    : 360; // дефолт 6:00/км
  
  // Оцениваем разницу
  const swimGap = (targetSwimPace - currentSwimPace) / currentSwimPace;
  const runGap = (targetRunPace - currentRunPace) / currentRunPace;
  
  // Определяем сложность
  let difficulty: 'easy' | 'realistic' | 'challenging' | 'unrealistic';
  let message: string;
  const suggestions: string[] = [];

  if (swimGap < -0.3 || runGap < -0.3) {
    difficulty = 'unrealistic';
    message = '⚠️ Цель слишком амбициозная для текущего уровня формы. Риск перетренированности и травм.';
    suggestions.push('Рассмотрите более реалистичную цель');
    suggestions.push('Увеличьте время подготовки');
    suggestions.push('Сконцентрируйтесь на базовой выносливости');
  } else if (swimGap < -0.15 || runGap < -0.15) {
    difficulty = 'challenging';
    message = '💪 Амбициозная, но достижимая цель. Потребуется дисциплина и качественная работа.';
    suggestions.push('Увеличьте долю интенсивных тренировок');
    suggestions.push('Добавьте специфические работы (темповые, интервалы)');
    suggestions.push('Уделите внимание питанию и восстановлению');
  } else if (swimGap > 0.15 || runGap > 0.15) {
    difficulty = 'easy';
    message = '✅ Реалистичная цель. Можно достичь с комфортным запасом.';
    suggestions.push('Сфокусируйтесь на технике и эффективности');
    suggestions.push('Можно добавить больше восстановительных тренировок');
    suggestions.push('Рассмотрите более амбициозную цель');
  } else {
    difficulty = 'realistic';
    message = '🎯 Отлично сбалансированная цель! Идеально подходит для вашего уровня.';
    suggestions.push('Следуйте плану последовательно');
    suggestions.push('Обращайте внимание на качество каждой тренировки');
    suggestions.push('Следите за восстановлением');
  }

  return {
    isRealistic: difficulty !== 'unrealistic',
    difficulty,
    message,
    suggestions,
  };
}

export function getTrainingIntensityMultiplier(difficulty: 'easy' | 'realistic' | 'challenging' | 'unrealistic'): number {
  switch (difficulty) {
    case 'easy': return 0.85;
    case 'realistic': return 1.0;
    case 'challenging': return 1.15;
    case 'unrealistic': return 1.25;
  }
}

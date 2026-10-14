import React, { useMemo } from 'react';
import { TrainingLogEntry, FitnessMetrics, Badge, MOTIVATIONAL_QUOTES } from '../types';
import { calculateFitnessMetrics } from '../planGenerator';

interface Props {
  log: TrainingLogEntry[];
  badges: Badge[];
  raceDate: string;
  goalRace: string;
}

export const Analytics: React.FC<Props> = ({ log, badges, raceDate, goalRace }) => {
  const metrics = useMemo(() => calculateFitnessMetrics(log), [log]);

  // Countdown
  const daysToRace = Math.max(0, Math.ceil((new Date(raceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  // Weekly TSS chart data
  const weeklyData = useMemo(() => {
    const weeks: { label: string; tss: number; hours: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + now.getDay()) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekLog = log.filter(e => {
        const d = new Date(e.date);
        return d >= weekStart && d < weekEnd;
      });
      weeks.push({
        label: `Н-${i}`,
        tss: weekLog.reduce((s, e) => s + e.tss, 0),
        hours: weekLog.reduce((s, e) => s + e.actualDuration, 0) / 60,
      });
    }
    return weeks;
  }, [log]);

  const maxTSS = Math.max(...weeklyData.map(w => w.tss), 1);

  // Streak
  const streak = useMemo(() => {
    if (log.length === 0) return 0;
    const sorted = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    while (true) {
      const hasEntry = sorted.some(e => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      if (hasEntry) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [log]);

  // Readiness indicator
  const readinessColor = metrics.tsb > 0 ? 'text-green-500' : metrics.tsb > -15 ? 'text-yellow-500' : 'text-red-500';
  const readinessBg = metrics.tsb > 0 ? 'bg-green-50 border-green-200' : metrics.tsb > -15 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const readinessLabel = metrics.tsb > 0 ? 'Отличная форма' : metrics.tsb > -15 ? 'Умеренная усталость' : 'Высокая усталость';

  // Random motivational quote
  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  return (
    <div className="space-y-6">
      {/* Countdown + Quote */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-white/70 mb-1">До гонки{goalRace ? ` «${goalRace}»` : ''}</p>
            <div className="text-5xl font-bold">{daysToRace}</div>
            <p className="text-sm text-white/70">дней</p>
          </div>
          <div className="text-center md:text-right max-w-sm">
            <p className="text-sm italic text-white/80">{quote}</p>
          </div>
        </div>
      </div>

      {/* Fitness metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Форма (CTL)</div>
          <div className="text-2xl font-bold text-green-600">{metrics.ctl}</div>
          <div className="text-xs text-gray-400">Хроническая нагрузка</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Усталость (ATL)</div>
          <div className="text-2xl font-bold text-orange-600">{metrics.atl}</div>
          <div className="text-xs text-gray-400">Острая нагрузка</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Баланс (TSB)</div>
          <div className={`text-2xl font-bold ${readinessColor}`}>{metrics.tsb > 0 ? '+' : ''}{metrics.tsb}</div>
          <div className="text-xs text-gray-400">CTL − ATL</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Ramp Rate</div>
          <div className="text-2xl font-bold text-blue-600">{metrics.rampRate}</div>
          <div className="text-xs text-gray-400">Рост CTL/нед</div>
        </div>
      </div>

      {/* Readiness */}
      <div className={`rounded-xl p-4 border ${readinessBg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${readinessColor} bg-white/50`}>
            <i className="fas fa-heart-pulse text-lg"></i>
          </div>
          <div>
            <div className={`font-semibold ${readinessColor}`}>{readinessLabel}</div>
            <div className="text-sm text-gray-600">
              {metrics.tsb > 0 ? 'Вы в отличной форме для тяжёлых тренировок!' :
               metrics.tsb > -15 ? 'Можно тренироваться, но следите за самочувствием.' :
               'Рекомендуется снизить нагрузку или взять день отдыха.'}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly TSS chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-chart-bar text-indigo-500"></i>
          Нагрузка по неделям (TSS)
        </h3>
        <div className="flex items-end gap-1 h-40">
          {weeklyData.map((week, idx) => {
            const height = (week.tss / maxTSS) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {week.tss}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-md transition-all hover:from-indigo-600 hover:to-purple-500"
                  style={{ height: `${Math.max(height, 2)}%` }}
                ></div>
                <div className="text-[10px] text-gray-400">{week.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-fire text-orange-500"></i>
          Серия тренировок
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-orange-500">{streak}</div>
          <div>
            <div className="text-sm text-gray-600">дней подряд</div>
            <div className="text-xs text-gray-400">
              {streak === 0 ? 'Начните серию сегодня!' :
               streak < 3 ? 'Хорошее начало!' :
               streak < 7 ? 'Отличный ритм!' :
               streak < 14 ? 'Невероятная дисциплина!' : '🔥 Легендарная серия!'}
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-medal text-yellow-500"></i>
          Достижения
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map(badge => (
            <div key={badge.id} className={`p-3 rounded-xl text-center transition-all ${
              badge.earned
                ? 'bg-yellow-50 border-2 border-yellow-200 shadow-sm'
                : 'bg-gray-50 border-2 border-gray-100 opacity-50'
            }`}>
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium text-gray-700">{badge.name}</div>
              <div className="text-[10px] text-gray-400 mt-1">{badge.description}</div>
              {badge.earned && badge.earnedDate && (
                <div className="text-[10px] text-yellow-600 mt-1">✓ {badge.earnedDate}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

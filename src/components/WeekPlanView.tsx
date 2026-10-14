import React, { useState } from 'react';
import { WeekPlan, TrainingSession, Sport, AthleteProfile } from '../types';
import { analyzeHealthRestrictions } from '../healthAnalyzer';

import { RaceConfig } from '../types';
import { calculatePace, formatTime } from '../goalAnalyzer';

interface Props {
  plan: WeekPlan;
  weekNumber: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
  profile: AthleteProfile;
  raceConfig: RaceConfig;
}

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const SPORT_CONFIG: Record<Sport, { icon: string; color: string; bg: string; name: string }> = {
  swim: { icon: '🏊', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', name: 'Плавание' },
  bike: { icon: '🚴', color: 'text-green-600', bg: 'bg-green-50 border-green-200', name: 'Велосипед' },
  run: { icon: '🏃', color: 'text-red-600', bg: 'bg-red-50 border-red-200', name: 'Бег' },
};

const SESSION_TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; name: string }> = {
  strength: { icon: '💪', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', name: 'Силовая' },
  core: { icon: '🎯', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', name: 'Кор' },
  stretch: { icon: '🧘', color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', name: 'Растяжка' },
};

const INTENSITY_COLORS: Record<string, string> = {
  easy: 'bg-green-400',
  moderate: 'bg-yellow-400',
  hard: 'bg-red-400',
  recovery: 'bg-sky-300',
};

const SessionCard: React.FC<{ session: TrainingSession }> = ({ session }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Определяем конфигурацию на основе типа сессии
  const isSpecialSession = ['strength', 'core', 'stretch'].includes(session.type);
  const config = isSpecialSession ? SESSION_TYPE_CONFIG[session.type] : SPORT_CONFIG[session.sport];

  return (
    <div
      className={`rounded-xl border-2 p-3 cursor-pointer transition-all hover:shadow-md ${config.bg}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <div>
            <div className={`font-medium text-sm ${config.color}`}>{config.name}</div>
            <div className="text-xs text-gray-500">{session.duration} мин</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${INTENSITY_COLORS[session.intensity]}`} title={session.intensity} />
          <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}></i>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{session.description}</p>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2">
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{session.details}</p>
          {!isSpecialSession && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] bg-white/80 rounded-full px-2 py-1 text-red-600">
                <i className="fas fa-heart-pulse"></i> {session.targetHR}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-white/80 rounded-full px-2 py-1 text-purple-600">
                <i className="fas fa-gauge-high"></i> {session.targetPace}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const WeekPlanView: React.FC<Props> = ({ plan, weekNumber, totalWeeks, onWeekChange, profile, raceConfig }) => {
  const sessionsByDay: Record<number, TrainingSession[]> = {};
  plan.sessions.forEach((s) => {
    if (!sessionsByDay[s.day]) sessionsByDay[s.day] = [];
    sessionsByDay[s.day].push(s);
  });

  const healthRecs = analyzeHealthRestrictions(profile);
  const hasHealthRestrictions = healthRecs.length > 0;
  
  // Рассчитываем целевые темпы
  const distances: Record<string, number> = {
    sprint: 0.75, olympic: 1.5, 'half_iron': 1.9, ironman: 3.8,
  };
  const targetSwimPace = raceConfig.targetSwimTime / (distances[raceConfig.distance] || 1.5); // сек/км
  const targetRunPace = raceConfig.targetRunTime / (raceConfig.distance === 'sprint' ? 5 : raceConfig.distance === 'olympic' ? 10 : raceConfig.distance === 'half_iron' ? 21.1 : 42.2);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <i className="fas fa-calendar-alt text-sm"></i>
            </span>
            Неделя {weekNumber} из {totalWeeks}
          </h2>
          <p className="text-sm text-gray-500 mt-1 ml-10">
            <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {plan.phase}
            </span>
            <span className="ml-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              TSS: {plan.plannedTSS}
            </span>
            {raceConfig.targetTime && (
              <span className="ml-2 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                🎯 Цель: {raceConfig.targetTime}
              </span>
            )}
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onWeekChange(Math.max(1, weekNumber - 1))}
            disabled={weekNumber <= 1}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-30 transition-all"
          >
            <i className="fas fa-chevron-left text-xs text-gray-600"></i>
          </button>
          <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
            {weekNumber} / {totalWeeks}
          </span>
          <button
            onClick={() => onWeekChange(Math.min(totalWeeks, weekNumber + 1))}
            disabled={weekNumber >= totalWeeks}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-300 transition-all"
          >
            <i className="fas fa-chevron-right text-xs text-gray-600"></i>
          </button>
        </div>
      </div>

      {/* Volume summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-blue-600">{plan.swimVolume}ч</div>
          <div className="text-xs text-blue-500">🏊 Плавание</div>
          {raceConfig.targetTime && (
            <div className="text-[10px] text-blue-400 mt-1">
              Цель: {Math.floor(raceConfig.targetSwimTime / 60)}:{(raceConfig.targetSwimTime % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-600">{plan.bikeVolume}ч</div>
          <div className="text-xs text-green-500">🚴 Велосипед</div>
          {raceConfig.targetTime && (
            <div className="text-[10px] text-green-400 mt-1">
              Цель: {Math.floor(raceConfig.targetBikeTime / 3600)}:{Math.floor((raceConfig.targetBikeTime % 3600) / 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-red-600">{plan.runVolume}ч</div>
          <div className="text-xs text-red-500">🏃 Бег</div>
          {raceConfig.targetTime && (
            <div className="text-[10px] text-red-400 mt-1">
              Цель: {Math.floor(raceConfig.targetRunTime / 60)}:{(raceConfig.targetRunTime % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Total hours */}
      <div className="bg-gray-50 rounded-xl p-3 mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-600">Общий объём:</span>
        <span className="font-bold text-gray-800">{plan.totalHours} часов</span>
      </div>

      {/* Health adjustments banner */}
      {hasHealthRestrictions && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0">⚕️</span>
            <div>
              <div className="font-medium text-sm text-amber-800 mb-1">План скорректирован с учётом ваших ограничений</div>
              <div className="text-xs text-amber-700 space-y-1">
                {healthRecs.slice(0, 2).map((rec, idx) => (
                  <div key={idx}>• {rec.title.replace(/[⚠️ℹ️🚨]/g, '').trim()}: {rec.adjustments[0]}</div>
                ))}
                {healthRecs.length > 2 && (
                  <div className="text-amber-500">... и ещё {healthRecs.length - 2} рекомендаций. Подробнее в Профиле → Здоровье</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Week grid */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {DAY_NAMES.map((dayName, dayIndex) => {
          const daySessions = sessionsByDay[dayIndex] || [];
          const hasMultiple = daySessions.length > 1;
          return (
            <div key={dayIndex} className={`min-h-[120px] ${hasMultiple ? 'bg-indigo-50/50 rounded-xl p-1.5 -m-1.5' : ''}`}>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase">{dayName}</span>
                {hasMultiple && (
                  <span className="text-[9px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                    x{daySessions.length}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {daySessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
                {daySessions.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-gray-100 p-3 text-center">
                    <span className="text-xs text-gray-300">Отдых</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Intensity legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="font-medium">Интенсивность:</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-300"></div>
          <span>Восстановление</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          <span>Лёгкая</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <span>Умеренная</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <span>Высокая</span>
        </div>
      </div>
    </div>
  );
};

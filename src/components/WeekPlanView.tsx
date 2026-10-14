import React, { useState } from 'react';
import { WeekPlan, TrainingSession, Sport, AthleteProfile, RaceConfig } from '../types';
import { analyzeHealthRestrictions } from '../healthAnalyzer';

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
  swim: { icon: '🏊', color: '#0077B6', bg: 'rgba(0, 119, 182, 0.08)', name: 'Плавание' },
  bike: { icon: '🚴', color: '#2D6A4F', bg: 'rgba(45, 106, 79, 0.08)', name: 'Велосипед' },
  run: { icon: '🏃', color: '#E85D04', bg: 'rgba(232, 93, 4, 0.08)', name: 'Бег' },
};

const SESSION_TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; name: string }> = {
  strength: { icon: '💪', color: '#7B2CBF', bg: 'rgba(123, 44, 191, 0.08)', name: 'Силовая' },
  core: { icon: '🎯', color: '#3A0CA3', bg: 'rgba(58, 12, 163, 0.08)', name: 'Кор' },
  stretch: { icon: '🧘', color: '#F72585', bg: 'rgba(247, 37, 133, 0.08)', name: 'Растяжка' },
  brick: { icon: '🔗', color: '#E85D04', bg: 'rgba(232, 93, 4, 0.1)', name: 'Брик' },
};

const INTENSITY_COLORS: Record<string, string> = {
  easy: '#00c853',
  moderate: '#ff9800',
  hard: '#f44336',
  recovery: '#00a4e4',
};

const SessionCard: React.FC<{ session: TrainingSession }> = ({ session }) => {
  const [expanded, setExpanded] = useState(false);
  const isSpecialSession = ['strength', 'core', 'stretch', 'brick'].includes(session.type);
  const config = isSpecialSession ? SESSION_TYPE_CONFIG[session.type] : SPORT_CONFIG[session.sport];
  const isBrick = session.type === 'brick';
  const brickCombo = isBrick 
    ? (session.sport === 'run' ? '🚴→🏃 Вело+Бег' : '🏊→🚴 Плавание+Вело')
    : '';

  return (
    <div
      className="rounded-xl p-3 cursor-pointer transition-all hover:shadow-md"
      style={{ 
        backgroundColor: config.bg, 
        border: `2px ${isBrick ? 'dashed' : 'solid'} ${config.color}30`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <div>
            <div className="font-medium text-sm" style={{ color: config.color }}>
              {isBrick ? brickCombo : config.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{session.duration} мин</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS[session.intensity] }} />
          <i className={`fas fa-chevron-down text-xs transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-tertiary)' }}></i>
        </div>
      </div>
      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{session.description}</p>
      {expanded && (
        <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>{session.details}</p>
          {!isSpecialSession && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-1" style={{ backgroundColor: 'var(--bg-primary)', color: '#f44336' }}>
                <i className="fas fa-heart-pulse"></i> {session.targetHR}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-1" style={{ backgroundColor: 'var(--bg-primary)', color: '#7B2CBF' }}>
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

  return (
    <div className="garmin-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
              <i className="fas fa-calendar-alt text-sm"></i>
            </span>
            Неделя {weekNumber} из {totalWeeks}
          </h2>
          <p className="mt-1 ml-10 flex flex-wrap items-center gap-2">
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
              {plan.phase}
            </span>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              TSS: {plan.plannedTSS}
            </span>
            {raceConfig.targetTime && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
                🎯 Цель: {raceConfig.targetTime}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onWeekChange(Math.max(1, weekNumber - 1))}
            disabled={weekNumber <= 1}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-all"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <i className="fas fa-chevron-left text-xs" style={{ color: 'var(--text-secondary)' }}></i>
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center" style={{ color: 'var(--text-secondary)' }}>
            {weekNumber} / {totalWeeks}
          </span>
          <button
            onClick={() => onWeekChange(Math.min(totalWeeks, weekNumber + 1))}
            disabled={weekNumber >= totalWeeks}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-all"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <i className="fas fa-chevron-right text-xs" style={{ color: 'var(--text-secondary)' }}></i>
          </button>
        </div>
      </div>

      {/* Volume summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0077B6' }}>{plan.swimVolume}ч</div>
          <div className="stat-label">🏊 Плавание</div>
          {raceConfig.targetTime && (
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Цель: {Math.floor(raceConfig.targetSwimTime / 60)}:{(raceConfig.targetSwimTime % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#2D6A4F' }}>{plan.bikeVolume}ч</div>
          <div className="stat-label">🚴 Велосипед</div>
          {raceConfig.targetTime && (
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Цель: {Math.floor(raceConfig.targetBikeTime / 3600)}:{Math.floor((raceConfig.targetBikeTime % 3600) / 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#E85D04' }}>{plan.runVolume}ч</div>
          <div className="stat-label">🏃 Бег</div>
          {raceConfig.targetTime && (
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Цель: {Math.floor(raceConfig.targetRunTime / 60)}:{(raceConfig.targetRunTime % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Total hours */}
      <div className="rounded-xl p-3 mb-6 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Общий объём:</span>
        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{plan.totalHours} часов</span>
      </div>

      {/* Health adjustments banner */}
      {hasHealthRestrictions && (
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(255, 152, 0, 0.08)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0">⚕️</span>
            <div>
              <div className="font-medium text-sm" style={{ color: '#ff9800' }}>План скорректирован с учётом ваших ограничений</div>
              <div className="text-xs mt-1 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {healthRecs.slice(0, 2).map((rec, idx) => (
                  <div key={idx}>• {rec.title.replace(/[⚠️ℹ️🚨]/g, '').trim()}: {rec.adjustments[0]}</div>
                ))}
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
            <div key={dayIndex} className={`min-h-[120px] ${hasMultiple ? 'rounded-xl p-1.5 -m-1.5' : ''}`} style={hasMultiple ? { backgroundColor: 'var(--bg-tertiary)' } : {}}>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{dayName}</span>
                {hasMultiple && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                    x{daySessions.length}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {daySessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
                {daySessions.length === 0 && (
                  <div className="rounded-xl p-3 text-center" style={{ border: '2px dashed var(--border-color)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Отдых</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Intensity legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span className="font-medium">Интенсивность:</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS.recovery }}></div>
          <span>Восстановление</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS.easy }}></div>
          <span>Лёгкая</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS.moderate }}></div>
          <span>Умеренная</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS.hard }}></div>
          <span>Высокая</span>
        </div>
        <div className="flex items-center gap-1 ml-4 pl-4" style={{ borderLeft: '1px solid var(--border-color)' }}>
          <span className="text-orange-500">🔗</span>
          <span>Брик</span>
        </div>
      </div>
    </div>
  );
};

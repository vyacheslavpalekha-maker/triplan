import React from 'react';
import { RaceConfig, Distance, DISTANCE_INFO, AthleteProfile } from '../types';
import { calculateTargetTimes, analyzeGoalRealism } from '../goalAnalyzer';
import { MAX_PLAN_WEEKS, MIN_PLAN_WEEKS, weeksUntilRace } from '../lib/schedule';

interface Props {
  raceConfig: RaceConfig;
  onChange: (config: RaceConfig) => void;
  profile: AthleteProfile;
}

export const RaceConfigForm: React.FC<Props> = ({ raceConfig, onChange, profile }) => {
  const update = (field: keyof RaceConfig, value: any) => {
    onChange({ ...raceConfig, [field]: value });
  };

  const handleTargetTimeChange = (time: string) => {
    const targetTimes = calculateTargetTimes(time, raceConfig.distance);
    onChange({
      ...raceConfig,
      targetTime: time,
      targetSwimTime: targetTimes.swim,
      targetBikeTime: targetTimes.bike,
      targetRunTime: targetTimes.run,
    });
  };

  const goalAnalysis = analyzeGoalRealism(profile, raceConfig);
  
  const difficultyStyles = {
    easy: { bg: 'rgba(0, 200, 83, 0.08)', border: 'rgba(0, 200, 83, 0.3)', text: '#00c853', label: 'Реалистичная' },
    realistic: { bg: 'rgba(0, 124, 195, 0.08)', border: 'rgba(0, 124, 195, 0.3)', text: 'var(--accent-primary)', label: 'Оптимальная' },
    challenging: { bg: 'rgba(255, 152, 0, 0.08)', border: 'rgba(255, 152, 0, 0.3)', text: '#ff9800', label: 'Амбициозная' },
    unrealistic: { bg: 'rgba(244, 67, 54, 0.08)', border: 'rgba(244, 67, 54, 0.3)', text: '#f44336', label: 'Слишком амбициозная' },
  };
  const dStyle = difficultyStyles[goalAnalysis.difficulty];

  return (
    <div className="garmin-card p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--warning)' }}>
          <i className="fas fa-trophy text-sm"></i>
        </span>
        Целевая гонка
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Дистанция</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DISTANCE_INFO).map(([key, info]) => (
              <button key={key} onClick={() => update('distance', key as Distance)}
                className="p-3 rounded-xl text-left transition-all"
                style={{
                  border: `2px solid ${raceConfig.distance === key ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  backgroundColor: raceConfig.distance === key ? 'rgba(0, 124, 195, 0.05)' : 'var(--bg-tertiary)',
                }}>
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{info.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  🏊 {info.swim} • 🚴 {info.bike} • 🏃 {info.run}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Дата старта</label>
          <input type="date" value={raceConfig.raceDate}
            onChange={(e) => {
              const date = e.target.value;
              if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
              onChange({ ...raceConfig, raceDate: date, weeksToRace: weeksUntilRace(date) });
            }}
            className="garmin-input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Недель до старта: <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{raceConfig.weeksToRace}</span>
          </label>
          <input type="range" min={MIN_PLAN_WEEKS} max={MAX_PLAN_WEEKS} value={Math.min(MAX_PLAN_WEEKS, Math.max(MIN_PLAN_WEEKS, raceConfig.weeksToRace))}
            onChange={(e) => update('weeksToRace', parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ backgroundColor: 'var(--bg-tertiary)', accentColor: 'var(--accent-primary)' }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            <span>4 недели</span>
            <span>30 недель</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Целевое время</label>
          <input type="text" value={raceConfig.targetTime} onChange={(e) => handleTargetTimeChange(e.target.value)}
            placeholder="ЧЧ:ММ:СС"
            className="garmin-input w-full text-center text-lg font-mono" />
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'rgba(0, 119, 182, 0.08)' }}>
              <div className="font-semibold" style={{ color: '#0077B6' }}>
                {Math.floor(raceConfig.targetSwimTime / 60)}:{(raceConfig.targetSwimTime % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ color: 'var(--text-tertiary)' }}>🏊 Плавание</div>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'rgba(45, 106, 79, 0.08)' }}>
              <div className="font-semibold" style={{ color: '#2D6A4F' }}>
                {Math.floor(raceConfig.targetBikeTime / 3600)}:{Math.floor((raceConfig.targetBikeTime % 3600) / 60).toString().padStart(2, '0')}
              </div>
              <div style={{ color: 'var(--text-tertiary)' }}>🚴 Велосипед</div>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'rgba(232, 93, 4, 0.08)' }}>
              <div className="font-semibold" style={{ color: '#E85D04' }}>
                {Math.floor(raceConfig.targetRunTime / 60)}:{(raceConfig.targetRunTime % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ color: 'var(--text-tertiary)' }}>🏃 Бег</div>
            </div>
          </div>
        </div>

        {raceConfig.targetTime && (
          <div className="rounded-xl p-4" style={{ backgroundColor: dStyle.bg, border: `2px solid ${dStyle.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: dStyle.text, backgroundColor: 'var(--bg-primary)' }}>
                {dStyle.label}
              </span>
            </div>
            <p className="text-sm mb-2" style={{ color: dStyle.text }}>{goalAnalysis.message}</p>
            <div className="space-y-1">
              {goalAnalysis.suggestions.map((s, i) => (
                <div key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-0.5" style={{ color: 'var(--text-tertiary)' }}>•</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

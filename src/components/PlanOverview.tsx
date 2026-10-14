import React from 'react';
import { WeekPlan } from '../types';

interface Props {
  plans: WeekPlan[];
  currentWeek: number;
  onWeekSelect: (week: number) => void;
}

export const PlanOverview: React.FC<Props> = ({ plans, currentWeek, onWeekSelect }) => {
  const maxHours = Math.max(...plans.map(p => p.totalHours));

  return (
    <div className="garmin-card p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
          <i className="fas fa-chart-bar text-sm"></i>
        </span>
        Обзор плана
      </h2>

      {/* Volume chart */}
      <div className="mb-6">
        <div className="flex items-end gap-1 h-32">
          {plans.map((plan, idx) => {
            const height = (plan.totalHours / maxHours) * 100;
            const isCurrent = idx + 1 === currentWeek;
            return (
              <button
                key={idx}
                onClick={() => onWeekSelect(idx + 1)}
                className="flex-1 rounded-t-md transition-all relative group"
                style={{ 
                  height: `${height}%`, 
                  minHeight: '4px',
                  backgroundColor: isCurrent ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                }}
                title={`Неделя ${idx + 1}: ${plan.totalHours}ч`}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" style={{ backgroundColor: 'var(--text-primary)' }}>
                  {plan.totalHours}ч
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          <span>Неделя 1</span>
          <span>Неделя {plans.length}</span>
        </div>
      </div>

      {/* Phase breakdown */}
      <div className="space-y-2">
        {Array.from(new Set(plans.map(p => p.phase))).map((phase) => {
          const phaseWeeks = plans.filter(p => p.phase === phase);
          const firstWeek = phaseWeeks[0].weekNumber;
          const lastWeek = phaseWeeks[phaseWeeks.length - 1].weekNumber;
          const avgHours = (phaseWeeks.reduce((s, p) => s + p.totalHours, 0) / phaseWeeks.length).toFixed(1);
          return (
            <div key={phase} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{phase}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>
                  (нед. {firstWeek}{firstWeek !== lastWeek ? `-${lastWeek}` : ''})
                </span>
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>~{avgHours}ч/нед</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

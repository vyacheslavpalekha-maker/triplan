import React from 'react';
import type { BoardWeek } from '../lib/schedule';
import { phaseColor } from '../lib/schedule';

interface Props {
  plans: BoardWeek[];
  weekNumber: number;
}

export const PhaseStrip: React.FC<Props> = ({ plans, weekNumber }) => {
  if (plans.length === 0) return null;
  const phases: { name: string; count: number }[] = [];
  plans.forEach((plan) => {
    const last = phases[phases.length - 1];
    if (last && last.name === plan.phase) last.count += 1;
    else phases.push({ name: plan.phase, count: 1 });
  });
  const marker = ((weekNumber - 0.5) / plans.length) * 100;

  return (
    <div>
      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-full">
          {phases.map((phase) => (
            <div
              key={phase.name}
              title={phase.name}
              style={{ width: `${(phase.count / plans.length) * 100}%`, backgroundColor: phaseColor(phase.name) }}
            />
          ))}
        </div>
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${marker}%`, backgroundColor: 'var(--text-primary)', boxShadow: '0 0 0 2px var(--bg-primary)' }}
        />
      </div>
      <div className="mt-2 flex">
        {phases.map((phase) => (
          <div
            key={phase.name}
            className="truncate pr-2 text-[10px] font-medium"
            style={{ width: `${(phase.count / plans.length) * 100}%`, color: phaseColor(phase.name) }}
          >
            {phase.name.replace(' период', '').replace(' (Taper)', '')}
          </div>
        ))}
      </div>
    </div>
  );
};

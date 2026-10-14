import React from 'react';
import { AthleteProfile } from '../types';
import { analyzeHealthRestrictions, HealthRecommendation } from '../healthAnalyzer';

interface Props {
  profile: AthleteProfile;
}

const severityStyles = {
  high: {
    bg: 'rgba(244, 67, 54, 0.08)',
    border: 'rgba(244, 67, 54, 0.3)',
    badgeBg: 'rgba(244, 67, 54, 0.15)',
    badgeText: '#f44336',
    icon: '🚨',
  },
  medium: {
    bg: 'rgba(255, 152, 0, 0.08)',
    border: 'rgba(255, 152, 0, 0.3)',
    badgeBg: 'rgba(255, 152, 0, 0.15)',
    badgeText: '#ff9800',
    icon: '⚠️',
  },
  low: {
    bg: 'rgba(0, 124, 195, 0.08)',
    border: 'rgba(0, 124, 195, 0.3)',
    badgeBg: 'rgba(0, 124, 195, 0.15)',
    badgeText: 'var(--accent-primary)',
    icon: 'ℹ️',
  },
};

export const HealthRecommendations: React.FC<Props> = ({ profile }) => {
  const recommendations = analyzeHealthRestrictions(profile);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      {recommendations.map((rec, idx) => {
        const styles = severityStyles[rec.severity];
        return (
          <div key={idx} className="rounded-xl p-4" style={{ backgroundColor: styles.bg, border: `2px solid ${styles.border}` }}>
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{styles.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{rec.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: styles.badgeBg, color: styles.badgeText }}>
                    {rec.severity === 'high' ? 'Важно' : rec.severity === 'medium' ? 'Внимание' : 'Информация'}
                  </span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{rec.description}</p>
                <div className="space-y-1.5">
                  {rec.adjustments.map((adj, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs leading-5" style={{ color: 'var(--text-primary)' }}>{adj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <i className="fas fa-stethoscope mr-1" style={{ color: 'var(--text-tertiary)' }}></i>
          Эти рекомендации носят информационный характер. Обязательно проконсультируйтесь с врачом для индивидуального подхода.
        </p>
      </div>
    </div>
  );
};

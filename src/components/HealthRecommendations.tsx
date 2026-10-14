import React from 'react';
import { AthleteProfile } from '../types';
import { analyzeHealthRestrictions, HealthRecommendation } from '../healthAnalyzer';

interface Props {
  profile: AthleteProfile;
}

const severityStyles = {
  high: {
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: '🚨',
  },
  medium: {
    bg: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: '⚠️',
  },
  low: {
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
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
          <div key={idx} className={`rounded-xl border-2 p-4 ${styles.bg}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{styles.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-800">{rec.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                    {rec.severity === 'high' ? 'Важно' : rec.severity === 'medium' ? 'Внимание' : 'Информация'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                <div className="space-y-1.5">
                  {rec.adjustments.map((adj, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs leading-5">{adj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <p className="text-xs text-gray-500">
          <i className="fas fa-stethoscope mr-1 text-gray-400"></i>
          Эти рекомендации носят информационный характер. Обязательно проконсультируйтесь с врачом для индивидуального подхода.
        </p>
      </div>
    </div>
  );
};

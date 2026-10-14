import React from 'react';
import { RaceConfig, Distance, DISTANCE_INFO } from '../types';

interface Props {
  raceConfig: RaceConfig;
  onChange: (config: RaceConfig) => void;
}

export const RaceConfigForm: React.FC<Props> = ({ raceConfig, onChange }) => {
  const update = (field: keyof RaceConfig, value: any) => {
    onChange({ ...raceConfig, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
          <i className="fas fa-trophy text-sm"></i>
        </span>
        Целевая гонка
      </h2>

      <div className="space-y-4">
        {/* Distance selection */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Дистанция</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DISTANCE_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => update('distance', key as Distance)}
                className={`p-3 rounded-xl text-left transition-all border-2 ${
                  raceConfig.distance === key
                    ? 'border-orange-400 bg-orange-50 shadow-sm'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className="font-semibold text-sm text-gray-800">{info.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  🏊 {info.swim} • 🚴 {info.bike} • 🏃 {info.run}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Race date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Дата старта</label>
          <input
            type="date"
            value={raceConfig.raceDate}
            onChange={(e) => {
              const date = e.target.value;
              const today = new Date();
              const raceDay = new Date(date);
              const weeks = Math.max(4, Math.round((raceDay.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)));
              onChange({ ...raceConfig, raceDate: date, weeksToRace: weeks });
            }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Weeks to race */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Недель до старта: <span className="text-orange-600 font-bold">{raceConfig.weeksToRace}</span>
          </label>
          <input
            type="range"
            min={4}
            max={30}
            value={raceConfig.weeksToRace}
            onChange={(e) => update('weeksToRace', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4 недели</span>
            <span>30 недель</span>
          </div>
        </div>
      </div>
    </div>
  );
};

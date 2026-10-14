import React from 'react';
import { AthleteProfile, Level, LEVEL_INFO } from '../types';

interface Props {
  profile: AthleteProfile;
  onChange: (profile: AthleteProfile) => void;
}

export const AthleteProfileForm: React.FC<Props> = ({ profile, onChange }) => {
  const update = (field: keyof AthleteProfile, value: any) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <i className="fas fa-user text-sm"></i>
        </span>
        Профиль спортсмена
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Имя</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            placeholder="Введите имя"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Возраст</label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => update('age', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            min={16}
            max={80}
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Вес (кг)</label>
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => update('weight', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            min={40}
            max={150}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Пол</label>
          <div className="flex gap-2">
            <button
              onClick={() => update('gender', 'male')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                profile.gender === 'male'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Мужской
            </button>
            <button
              onClick={() => update('gender', 'female')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                profile.gender === 'female'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Женский
            </button>
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Уровень подготовки</label>
          <select
            value={profile.level}
            onChange={(e) => update('level', e.target.value as Level)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
          >
            {Object.entries(LEVEL_INFO).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name} — {info.description}
              </option>
            ))}
          </select>
        </div>

        {/* Weekly hours */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Часов в неделю</label>
          <input
            type="number"
            value={profile.weeklyHours}
            onChange={(e) => update('weeklyHours', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            min={3}
            max={30}
          />
        </div>

        {/* Training days */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Тренировочных дней в неделю</label>
          <div className="flex gap-1">
            {[3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => update('trainingDays', d)}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all text-sm ${
                  profile.trainingDays === d
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

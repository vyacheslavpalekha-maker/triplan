import React, { useState } from 'react';
import { AthleteProfile, Level, Sport, LEVEL_INFO } from '../types';
import { HealthRecommendations } from './HealthRecommendations';

interface Props {
  profile: AthleteProfile;
  onChange: (profile: AthleteProfile) => void;
}

const SPORT_LABELS: Record<Sport, string> = {
  swim: '🏊 Плавание',
  bike: '🚴 Велосипед',
  run: '🏃 Бег',
};

const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export const AthleteProfileForm: React.FC<Props> = ({ profile, onChange }) => {
  const [activeSection, setActiveSection] = useState<string>('basic');

  const update = (field: keyof AthleteProfile, value: any) => {
    onChange({ ...profile, [field]: value });
  };

  const updateHRZone = (zone: string, field: 'min' | 'max', value: number) => {
    onChange({
      ...profile,
      hrZones: { ...profile.hrZones, [zone]: { ...profile.hrZones[zone as keyof typeof profile.hrZones] as any, [field]: value } }
    });
  };

  const updateDayPref = (dayIndex: number, sport: Sport, checked: boolean) => {
    const current = profile.dayPreferences[dayIndex] || [];
    const updated = checked ? [...current, sport] : current.filter(s => s !== sport);
    const newPrefs = { ...profile.dayPreferences, [dayIndex]: updated };
    // Автоматически обновляем trainingDays на основе количества отмеченных дней
    const markedDays = [0,1,2,3,4,5,6].filter(d => (newPrefs[d] || []).length > 0).length;
    onChange({
      ...profile,
      dayPreferences: newPrefs,
      trainingDays: markedDays > 0 ? markedDays : profile.trainingDays,
    });
  };

  const autoFillScheduleForDays = (days: number) => {
    // Типичное распределение для триатлона:
    // Пн: плавание + бег
    // Вт: велосипед
    // Ср: плавание + бег
    // Чт: велосипед
    // Пт: плавание + бег
    // Сб: велосипед (длительная)
    // Вс: бег (длительный)
    const templates: Record<number, Sport[][]> = {
      3: [
        ['swim'], ['bike'], [], ['run'], [], ['bike'], ['run']
      ],
      4: [
        ['swim', 'run'], ['bike'], [], ['swim'], ['bike'], [], ['run']
      ],
      5: [
        ['swim', 'run'], ['bike'], ['swim', 'run'], ['bike'], ['run'], [], []
      ],
      6: [
        ['swim', 'run'], ['bike'], ['swim', 'run'], ['bike', 'run'], ['swim'], ['bike'], ['run']
      ],
      7: [
        ['swim', 'run'], ['bike'], ['swim', 'run'], ['bike', 'run'], ['swim', 'run'], ['bike'], ['run']
      ],
    };
    const template = templates[days] || templates[5];
    const newPrefs: Record<number, Sport[]> = {};
    for (let i = 0; i < 7; i++) {
      newPrefs[i] = template[i] || [];
    }
    onChange({ ...profile, trainingDays: days, dayPreferences: newPrefs });
  };

  const autoFillSchedule = () => {
    autoFillScheduleForDays(profile.trainingDays);
  };

  const sections = [
    { id: 'basic', label: 'Основное', icon: 'fa-user' },
    { id: 'zones', label: 'Пульсовые зоны', icon: 'fa-heart-pulse' },
    { id: 'pace', label: 'Темповые зоны', icon: 'fa-gauge-high' },
    { id: 'fitness', label: 'Текущая форма', icon: 'fa-chart-line' },
    { id: 'schedule', label: 'Расписание', icon: 'fa-calendar' },
    { id: 'health', label: 'Здоровье', icon: 'fa-shield-heart' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <i className="fas fa-user text-sm"></i>
            </span>
            Профиль спортсмена
          </h2>
          {(profile.healthRestrictions.injuries || profile.healthRestrictions.allergies) && (
            <button
              onClick={() => setActiveSection('health')}
              className={`text-xs px-2.5 py-1.5 rounded-full font-medium flex items-center gap-1 ${
                activeSection === 'health'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <i className="fas fa-heart-pulse text-[10px]"></i>
              Есть ограничения
            </button>
          )}
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 -mx-2 px-2">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`fas ${s.icon} text-[10px]`}></i>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 pt-4">
        {/* Basic info */}
        {activeSection === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Имя</label>
              <input type="text" value={profile.name} onChange={(e) => update('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Введите имя" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Возраст</label>
                <input type="number" value={profile.age} onChange={(e) => update('age', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Вес (кг)</label>
                <input type="number" value={profile.weight} onChange={(e) => update('weight', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Пол</label>
              <div className="flex gap-2">
                <button onClick={() => update('gender', 'male')}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${profile.gender === 'male' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Мужской
                </button>
                <button onClick={() => update('gender', 'female')}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${profile.gender === 'female' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Женский
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Уровень подготовки</label>
              <select value={profile.level} onChange={(e) => update('level', e.target.value as Level)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white">
                {Object.entries(LEVEL_INFO).map(([key, info]) => (
                  <option key={key} value={key}>{info.name} — {info.description}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Часов в неделю</label>
                <input type="number" value={profile.weeklyHours} onChange={(e) => update('weeklyHours', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Дней тренировок</label>
                <div className="flex gap-1">
                  {[3, 4, 5, 6, 7].map((d) => (
                    <button key={d} onClick={() => {
                      update('trainingDays', d);
                      // Автоматически перераспределяем расписание
                      autoFillScheduleForDays(d);
                    }}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all text-sm ${profile.trainingDays === d ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Целевая гонка</label>
              <input type="text" value={profile.goalRace} onChange={(e) => update('goalRace', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Например: IRONMAN Barcelona 2026" />
            </div>
          </div>
        )}

        {/* HR Zones */}
        {activeSection === 'zones' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Макс. ЧСС (уд/мин)</label>
                <input type="number" value={profile.hrZones.maxHR}
                  onChange={(e) => onChange({ ...profile, hrZones: { ...profile.hrZones, maxHR: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">ЧСС покоя (уд/мин)</label>
                <input type="number" value={profile.hrZones.restHR}
                  onChange={(e) => onChange({ ...profile, hrZones: { ...profile.hrZones, restHR: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Если не знаете точные значения, можно оценить: ЧСС макс ≈ 220 − возраст
            </p>
            <div className="space-y-2">
              {(['zone1', 'zone2', 'zone3', 'zone4', 'zone5'] as const).map((zone, i) => {
                const z = profile.hrZones[zone];
                const colors = ['bg-sky-100 border-sky-200', 'bg-green-100 border-green-200', 'bg-yellow-100 border-yellow-200', 'bg-orange-100 border-orange-200', 'bg-red-100 border-red-200'];
                return (
                  <div key={zone} className={`p-3 rounded-xl border ${colors[i]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Зона {i + 1}: {z.name}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" value={z.min} onChange={(e) => updateHRZone(zone, 'min', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center text-sm outline-none" />
                        <span className="text-gray-400">—</span>
                        <input type="number" value={z.max} onChange={(e) => updateHRZone(zone, 'max', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center text-sm outline-none" />
                        <span className="text-xs text-gray-500">уд/мин</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pace Zones */}
        {activeSection === 'pace' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">🏃 Лёгкий бег (мин/км)</label>
              <input type="text" value={profile.paceZones.runEasyPace}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, runEasyPace: e.target.value } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="6:30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">🏃 Темповый бег (мин/км)</label>
              <input type="text" value={profile.paceZones.runTempoPace}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, runTempoPace: e.target.value } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="5:30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">🏃 Пороговый бег (мин/км)</label>
              <input type="text" value={profile.paceZones.runThresholdPace}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, runThresholdPace: e.target.value } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="5:00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">🚴 FTP (ватт)</label>
              <input type="number" value={profile.paceZones.bikeFTP}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, bikeFTP: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="250" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">🏊 CSS (сек/100м)</label>
              <input type="number" value={profile.paceZones.swimCSS}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, swimCSS: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="120" />
            </div>
          </div>
        )}

        {/* Current fitness */}
        {activeSection === 'fitness' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 mb-2">
              <p className="text-xs text-blue-700">
                <i className="fas fa-info-circle mr-1"></i>
                Эти данные помогают адаптировать план под ваши реальные возможности
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Тест Купера (метры за 12 мин)</label>
              <input type="number" value={profile.currentFitness.cooperTest}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, cooperTest: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="2800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">FTP — функциональная пороговая мощность (ватт)</label>
              <input type="number" value={profile.currentFitness.ftp}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, ftp: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="250" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CSS — критическая скорость плавания (сек/100м)</label>
              <input type="number" value={profile.currentFitness.css}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, css: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="120" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">100м плавание (секунды)</label>
              <input type="number" value={profile.currentFitness.swim100m}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, swim100m: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="90" />
            </div>
          </div>
        )}

        {/* Day preferences */}
        {activeSection === 'schedule' && (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-3 mb-2">
              <p className="text-xs text-blue-700">
                <i className="fas fa-info-circle mr-1"></i>
                <strong>Отметьте дни тренировок и виды спорта для каждого дня.</strong><br/>
                Дни без отметок = дни отдыха. План будет ставить тренировки ТОЛЬКО в отмеченные дни.
              </p>
            </div>

            {/* Training days counter + auto-fill */}
            <div className="flex items-center justify-between gap-2">
              {(() => {
                const markedDays = [0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).length > 0).length;
                return (
                  <span className="text-xs text-gray-500">
                    Тренировочных дней: <strong className="text-gray-700">{markedDays}</strong> / {profile.trainingDays}
                  </span>
                );
              })()}
              <button
                onClick={autoFillSchedule}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <i className="fas fa-magic text-[10px]"></i>
                Автозаполнить
              </button>
            </div>

            {DAY_NAMES.map((dayName, dayIndex) => {
              const prefs = profile.dayPreferences[dayIndex] || [];
              const isRestDay = prefs.length === 0;
              const isWeekend = dayIndex >= 5;
              return (
                <div key={dayIndex} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  isRestDay 
                    ? 'border-gray-200 bg-gray-50 opacity-60' 
                    : 'border-blue-200 bg-blue-50/50'
                }`}>
                  <div className="w-28 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-700">{dayName}</span>
                      {isWeekend && <span className="text-[10px] text-orange-400">вых</span>}
                    </div>
                    {isRestDay && (
                      <div className="text-[10px] text-gray-400 mt-0.5">🛋 День отдыха</div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap flex-1">
                    {(['swim', 'bike', 'run'] as Sport[]).map(sport => {
                      const checked = prefs.includes(sport);
                      return (
                        <label key={sport} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border ${
                          checked
                            ? sport === 'swim' ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : sport === 'bike' ? 'bg-green-100 border-green-300 text-green-700'
                              : 'bg-red-100 border-red-300 text-red-700'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateDayPref(dayIndex, sport, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-xs">{SPORT_LABELS[sport]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
              <div className="text-xs font-medium text-gray-500 mb-2">Тренировок по видам спорта:</div>
              <div className="flex gap-4 text-xs">
                <span className="text-blue-600">
                  🏊 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).includes('swim')).length} дн.
                </span>
                <span className="text-green-600">
                  🚴 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).includes('bike')).length} дн.
                </span>
                <span className="text-red-600">
                  🏃 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).includes('run')).length} дн.
                </span>
                <span className="text-gray-400 ml-auto">
                  🛋 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).length === 0).length} дн. отдыха
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Health */}
        {activeSection === 'health' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Травмы / ограничения</label>
              <textarea
                value={profile.healthRestrictions.injuries}
                onChange={(e) => onChange({ ...profile, healthRestrictions: { ...profile.healthRestrictions, injuries: e.target.value } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                rows={2}
                placeholder="Например: эндопротезирование тазобедренного сустава, боль в колене"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Заболевания</label>
              <textarea
                value={profile.healthRestrictions.allergies}
                onChange={(e) => onChange({ ...profile, healthRestrictions: { ...profile.healthRestrictions, allergies: e.target.value } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                rows={2}
                placeholder="Например: гипертония, астма, диабет"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Дополнительные заметки</label>
              <textarea
                value={profile.healthRestrictions.notes}
                onChange={(e) => onChange({ ...profile, healthRestrictions: { ...profile.healthRestrictions, notes: e.target.value } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                rows={3}
                placeholder="Любая дополнительная информация о здоровье..."
              />
            </div>

            {/* Recommendations based on health data */}
            {(profile.healthRestrictions.injuries || profile.healthRestrictions.allergies || profile.healthRestrictions.notes) && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-lightbulb text-yellow-500"></i>
                  Рекомендации по корректировке плана
                </h3>
                <HealthRecommendations profile={profile} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

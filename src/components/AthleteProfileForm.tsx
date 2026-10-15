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
    const markedDays = [0,1,2,3,4,5,6].filter(d => (newPrefs[d] || []).length > 0).length;
    onChange({
      ...profile,
      dayPreferences: newPrefs,
      trainingDays: markedDays > 0 ? markedDays : profile.trainingDays,
    });
  };

  const autoFillScheduleForDays = (days: number) => {
    const templates: Record<number, Sport[][]> = {
      3: [['swim'], ['bike'], [], ['run'], [], ['bike'], ['run']],
      4: [['swim', 'run'], ['bike'], [], ['swim'], ['bike'], [], ['run']],
      5: [['swim', 'run'], ['bike'], ['swim', 'run'], ['bike'], ['run'], [], []],
      6: [['swim', 'run'], ['bike'], ['swim', 'run'], ['bike', 'run'], ['swim'], ['bike'], ['run']],
      7: [['swim', 'run'], ['bike'], ['swim', 'run'], ['bike', 'run'], ['swim', 'run'], ['bike'], ['run']],
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
    <div className="garmin-card overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
              <i className="fas fa-user text-sm"></i>
            </span>
            Профиль спортсмена
          </h2>
          {(profile.healthRestrictions.injuries || profile.healthRestrictions.allergies) && (
            <button
              onClick={() => setActiveSection('health')}
              className={`text-xs px-2.5 py-1.5 rounded-full font-medium flex items-center gap-1 ${
                activeSection === 'health' ? '' : ''
              }`}
              style={{ 
                backgroundColor: activeSection === 'health' ? 'var(--accent-primary)' : 'rgba(244, 67, 54, 0.1)',
                color: activeSection === 'health' ? 'white' : 'var(--error)',
              }}
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
                activeSection === s.id ? 'tab-btn active' : 'tab-btn'
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Имя</label>
              <input type="text" value={profile.name} onChange={(e) => update('name', e.target.value)}
                className="garmin-input w-full" placeholder="Введите имя" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Возраст</label>
                <input type="number" value={profile.age} onChange={(e) => update('age', parseInt(e.target.value) || 0)}
                  className="garmin-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Вес (кг)</label>
                <input type="number" value={profile.weight} onChange={(e) => update('weight', parseInt(e.target.value) || 0)}
                  className="garmin-input w-full" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Пол</label>
              <div className="flex gap-2">
                <button onClick={() => update('gender', 'male')}
                  className="flex-1 py-2.5 rounded-lg font-medium transition-all"
                  style={{ 
                    backgroundColor: profile.gender === 'male' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: profile.gender === 'male' ? 'white' : 'var(--text-secondary)',
                  }}>
                  Мужской
                </button>
                <button onClick={() => update('gender', 'female')}
                  className="flex-1 py-2.5 rounded-lg font-medium transition-all"
                  style={{ 
                    backgroundColor: profile.gender === 'female' ? '#F72585' : 'var(--bg-tertiary)',
                    color: profile.gender === 'female' ? 'white' : 'var(--text-secondary)',
                  }}>
                  Женский
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Уровень подготовки</label>
              <select value={profile.level} onChange={(e) => update('level', e.target.value as Level)}
                className="garmin-input w-full">
                {Object.entries(LEVEL_INFO).map(([key, info]) => (
                  <option key={key} value={key}>{info.name} — {info.description}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Часов в неделю</label>
                <input type="number" value={profile.weeklyHours} onChange={(e) => update('weeklyHours', parseInt(e.target.value) || 0)}
                  className="garmin-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Дней тренировок</label>
                <div className="flex gap-1">
                  {[3, 4, 5, 6, 7].map((d) => (
                    <button key={d} onClick={() => {
                      update('trainingDays', d);
                      autoFillScheduleForDays(d);
                    }}
                      className="flex-1 py-2.5 rounded-lg font-medium transition-all text-sm"
                      style={{
                        backgroundColor: profile.trainingDays === d ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: profile.trainingDays === d ? 'white' : 'var(--text-secondary)',
                      }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Целевая гонка</label>
              <input type="text" value={profile.goalRace} onChange={(e) => update('goalRace', e.target.value)}
                className="garmin-input w-full" placeholder="Например: IRONMAN Barcelona 2026" />
            </div>
          </div>
        )}

        {/* HR Zones */}
        {activeSection === 'zones' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Макс. ЧСС (уд/мин)</label>
                <input type="number" value={profile.hrZones.maxHR}
                  onChange={(e) => onChange({ ...profile, hrZones: { ...profile.hrZones, maxHR: parseInt(e.target.value) || 0 } })}
                  className="garmin-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>ЧСС покоя (уд/мин)</label>
                <input type="number" value={profile.hrZones.restHR}
                  onChange={(e) => onChange({ ...profile, hrZones: { ...profile.hrZones, restHR: parseInt(e.target.value) || 0 } })}
                  className="garmin-input w-full" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Если не знаете точные значения, можно оценить: ЧСС макс ≈ 220 − возраст
            </p>
            <div className="space-y-2">
              {(['zone1', 'zone2', 'zone3', 'zone4', 'zone5'] as const).map((zone, i) => {
                const z = profile.hrZones[zone];
                const colors = ['rgba(0, 164, 228, 0.1)', 'rgba(0, 200, 83, 0.1)', 'rgba(255, 152, 0, 0.1)', 'rgba(255, 87, 34, 0.1)', 'rgba(244, 67, 54, 0.1)'];
                return (
                  <div key={zone} className="p-3 rounded-xl" style={{ backgroundColor: colors[i], border: '1px solid var(--border-color)' }}>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Зона {i + 1}: {z.name}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <input type="number" value={z.min} onChange={(e) => updateHRZone(zone, 'min', parseInt(e.target.value) || 0)}
                          className="garmin-input zone-hr-input text-sm" />
                        <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                        <input type="number" value={z.max} onChange={(e) => updateHRZone(zone, 'max', parseInt(e.target.value) || 0)}
                          className="garmin-input zone-hr-input text-sm" />
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>уд/мин</span>
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>🏃 Лёгкий бег (мин/км)</label>
              <input type="text" value={profile.paceZones.runEasyPace}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, runEasyPace: e.target.value } })}
                className="garmin-input w-full" placeholder="6:30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>🏃 Темповый бег (мин/км)</label>
              <input type="text" value={profile.paceZones.runTempoPace}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, runTempoPace: e.target.value } })}
                className="garmin-input w-full" placeholder="5:30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>🏃 Пороговый бег (мин/км)</label>
              <input type="text" value={profile.paceZones.runThresholdPace}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, runThresholdPace: e.target.value } })}
                className="garmin-input w-full" placeholder="5:00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>🚴 FTP (ватт)</label>
              <input type="number" value={profile.paceZones.bikeFTP}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, bikeFTP: parseInt(e.target.value) || 0 } })}
                className="garmin-input w-full" placeholder="250" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>🏊 CSS (сек/100м)</label>
              <input type="number" value={profile.paceZones.swimCSS}
                onChange={(e) => onChange({ ...profile, paceZones: { ...profile.paceZones, swimCSS: parseInt(e.target.value) || 0 } })}
                className="garmin-input w-full" placeholder="120" />
            </div>
          </div>
        )}

        {/* Current fitness */}
        {activeSection === 'fitness' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 mb-2" style={{ backgroundColor: 'rgba(0, 124, 195, 0.08)' }}>
              <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                <i className="fas fa-info-circle mr-1"></i>
                Эти данные помогают адаптировать план под ваши реальные возможности
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Тест Купера (метры за 12 мин)</label>
              <input type="number" value={profile.currentFitness.cooperTest}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, cooperTest: parseInt(e.target.value) || 0 } })}
                className="garmin-input w-full" placeholder="2800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>FTP — функциональная пороговая мощность (ватт)</label>
              <input type="number" value={profile.currentFitness.ftp}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, ftp: parseInt(e.target.value) || 0 } })}
                className="garmin-input w-full" placeholder="250" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>CSS — критическая скорость плавания (сек/100м)</label>
              <input type="number" value={profile.currentFitness.css}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, css: parseInt(e.target.value) || 0 } })}
                className="garmin-input w-full" placeholder="120" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>100м плавание (секунды)</label>
              <input type="number" value={profile.currentFitness.swim100m}
                onChange={(e) => onChange({ ...profile, currentFitness: { ...profile.currentFitness, swim100m: parseInt(e.target.value) || 0 } })}
                className="garmin-input w-full" placeholder="90" />
            </div>
          </div>
        )}

        {/* Day preferences */}
        {activeSection === 'schedule' && (
          <div className="space-y-3">
            <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: 'rgba(0, 124, 195, 0.08)' }}>
              <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                <i className="fas fa-info-circle mr-1"></i>
                <strong>Отметьте дни тренировок и виды спорта для каждого дня.</strong><br/>
                Дни без отметок = дни отдыха.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2">
              {(() => {
                const markedDays = [0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).length > 0).length;
                return (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Тренировочных дней: <strong style={{ color: 'var(--text-primary)' }}>{markedDays}</strong> / {profile.trainingDays}
                  </span>
                );
              })()}
              <button onClick={autoFillSchedule} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent-primary)' }}>
                <i className="fas fa-magic text-[10px]"></i>
                Автозаполнить
              </button>
            </div>

            {DAY_NAMES.map((dayName, dayIndex) => {
              const prefs = profile.dayPreferences[dayIndex] || [];
              const isRestDay = prefs.length === 0;
              const isWeekend = dayIndex >= 5;
              return (
                <div key={dayIndex} className="flex items-center gap-3 p-2.5 rounded-xl transition-all" style={{
                  backgroundColor: isRestDay ? 'var(--bg-tertiary)' : 'rgba(0, 124, 195, 0.05)',
                  border: `1px solid ${isRestDay ? 'var(--border-color)' : 'rgba(0, 124, 195, 0.2)'}`,
                  opacity: isRestDay ? 0.6 : 1,
                }}>
                  <div className="w-28 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{dayName}</span>
                      {isWeekend && <span className="text-[10px]" style={{ color: 'var(--warning)' }}>вых</span>}
                    </div>
                    {isRestDay && (
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>🛋 День отдыха</div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap flex-1">
                    {(['swim', 'bike', 'run'] as Sport[]).map(sport => {
                      const checked = prefs.includes(sport);
                      const sportColors: Record<Sport, { active: string; border: string; text: string }> = {
                        swim: { active: 'rgba(0, 119, 182, 0.15)', border: '#0077B6', text: '#0077B6' },
                        bike: { active: 'rgba(45, 106, 79, 0.15)', border: '#2D6A4F', text: '#2D6A4F' },
                        run: { active: 'rgba(232, 93, 4, 0.15)', border: '#E85D04', text: '#E85D04' },
                      };
                      const sc = sportColors[sport];
                      return (
                        <label key={sport} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all" style={{
                          backgroundColor: checked ? sc.active : 'var(--bg-primary)',
                          border: `1px solid ${checked ? sc.border : 'var(--border-color)'}`,
                          color: checked ? sc.text : 'var(--text-tertiary)',
                        }}>
                          <input type="checkbox" checked={checked} onChange={(e) => updateDayPref(dayIndex, sport, e.target.checked)} className="sr-only" />
                          <span className="text-xs">{SPORT_LABELS[sport]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Тренировок по видам спорта:</div>
              <div className="flex gap-4 text-xs">
                <span style={{ color: '#0077B6' }}>🏊 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).includes('swim')).length} дн.</span>
                <span style={{ color: '#2D6A4F' }}>🚴 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).includes('bike')).length} дн.</span>
                <span style={{ color: '#E85D04' }}>🏃 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).includes('run')).length} дн.</span>
                <span className="ml-auto" style={{ color: 'var(--text-tertiary)' }}>🛋 {[0,1,2,3,4,5,6].filter(d => (profile.dayPreferences[d] || []).length === 0).length} дн. отдыха</span>
              </div>
            </div>
          </div>
        )}

        {/* Health */}
        {activeSection === 'health' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Травмы / ограничения</label>
              <textarea value={profile.healthRestrictions.injuries}
                onChange={(e) => onChange({ ...profile, healthRestrictions: { ...profile.healthRestrictions, injuries: e.target.value } })}
                className="garmin-input w-full resize-none" rows={2}
                placeholder="Например: эндопротезирование тазобедренного сустава, боль в колене" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Заболевания</label>
              <textarea value={profile.healthRestrictions.allergies}
                onChange={(e) => onChange({ ...profile, healthRestrictions: { ...profile.healthRestrictions, allergies: e.target.value } })}
                className="garmin-input w-full resize-none" rows={2}
                placeholder="Например: гипертония, астма, диабет" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Дополнительные заметки</label>
              <textarea value={profile.healthRestrictions.notes}
                onChange={(e) => onChange({ ...profile, healthRestrictions: { ...profile.healthRestrictions, notes: e.target.value } })}
                className="garmin-input w-full resize-none" rows={3}
                placeholder="Любая дополнительная информация о здоровье..." />
            </div>

            {(profile.healthRestrictions.injuries || profile.healthRestrictions.allergies || profile.healthRestrictions.notes) && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <i className="fas fa-lightbulb" style={{ color: 'var(--warning)' }}></i>
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

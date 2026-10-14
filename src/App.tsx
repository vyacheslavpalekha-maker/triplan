import React, { useState, useMemo } from 'react';
import { AthleteProfile, RaceConfig, WeekPlan } from './types';
import { generateFullPlan } from './planGenerator';
import { AthleteProfileForm } from './components/AthleteProfileForm';
import { RaceConfigForm } from './components/RaceConfigForm';
import { WeekPlanView } from './components/WeekPlanView';
import { PlanOverview } from './components/PlanOverview';

type View = 'setup' | 'plan';

const defaultProfile: AthleteProfile = {
  name: '',
  age: 30,
  weight: 75,
  gender: 'male',
  level: 'intermediate',
  weeklyHours: 10,
  trainingDays: 5,
};

const defaultRaceConfig: RaceConfig = {
  distance: 'olympic',
  weeksToRace: 16,
  raceDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

function App() {
  const [view, setView] = useState<View>('setup');
  const [profile, setProfile] = useState<AthleteProfile>(defaultProfile);
  const [raceConfig, setRaceConfig] = useState<RaceConfig>(defaultRaceConfig);
  const [currentWeek, setCurrentWeek] = useState(1);

  const plans: WeekPlan[] = useMemo(() => {
    if (view !== 'plan') return [];
    return generateFullPlan(profile, raceConfig);
  }, [view, profile, raceConfig]);

  const currentPlan = plans[currentWeek - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🏆</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">TriPlan</h1>
                <p className="text-xs text-gray-500">Тренировочный план для триатлона</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {view === 'plan' && (
                <button
                  onClick={() => setView('setup')}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Настройки
                </button>
              )}
              {view === 'setup' && (
                <button
                  onClick={() => {
                    setCurrentWeek(1);
                    setView('plan');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  Сформировать план <i className="fas fa-arrow-right ml-1"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'setup' ? (
          <div className="space-y-6">
            {/* Hero section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Создайте свой тренировочный план
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Заполните профиль и параметры гонки, чтобы получить персональный план подготовки к соревнованиям по триатлону
              </p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏊</span>
                  <span className="font-semibold text-blue-600">Плавание</span>
                </div>
                <p className="text-xs text-gray-500">Техника, выносливость, скорость. 2-3 тренировки в неделю.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🚴</span>
                  <span className="font-semibold text-green-600">Велосипед</span>
                </div>
                <p className="text-xs text-gray-500">Силовая работа, темп, длительные. 2-3 тренировки в неделю.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏃</span>
                  <span className="font-semibold text-red-600">Бег</span>
                </div>
                <p className="text-xs text-gray-500">Интервалы, темповые, длительные. 3-4 тренировки в неделю.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AthleteProfileForm profile={profile} onChange={setProfile} />
              <RaceConfigForm raceConfig={raceConfig} onChange={setRaceConfig} />
            </div>

            {/* Quick summary */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="font-bold text-lg mb-3">Предварительные параметры плана</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold">{raceConfig.weeksToRace}</div>
                  <div className="text-xs text-white/70">недель подготовки</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold">{profile.weeklyHours}ч</div>
                  <div className="text-xs text-white/70">в неделю</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold">{profile.trainingDays}</div>
                  <div className="text-xs text-white/70">дней тренировок</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold">{Math.round(profile.weeklyHours * raceConfig.weeksToRace)}</div>
                  <div className="text-xs text-white/70">общих часов</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  План для {profile.name || 'спортсмена'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Подготовка к дистанции «{
                    raceConfig.distance === 'sprint' ? 'Спринт' :
                    raceConfig.distance === 'olympic' ? 'Олимпийская' :
                    raceConfig.distance === 'half_iron' ? '70.3 (Half Ironman)' : 'IRONMAN'
                  }» • Старт: {new Date(raceConfig.raceDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Plan content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                {currentPlan && (
                  <WeekPlanView
                    plan={currentPlan}
                    weekNumber={currentWeek}
                    totalWeeks={raceConfig.weeksToRace}
                    onWeekChange={setCurrentWeek}
                  />
                )}
              </div>
              <div className="lg:col-span-1">
                <PlanOverview
                  plans={plans}
                  currentWeek={currentWeek}
                  onWeekSelect={setCurrentWeek}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          <p>TriPlan — Генератор тренировочных планов для триатлона</p>
          <p className="mt-1 text-xs">План носит рекомендательный характер. Проконсультируйтесь с тренером.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

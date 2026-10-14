import React, { useState, useMemo } from 'react';
import { AthleteProfile, RaceConfig, WeekPlan, TrainingLogEntry, Badge, Tab } from './types';
import { generateFullPlan } from './planGenerator';
import { AthleteProfileForm } from './components/AthleteProfileForm';
import { RaceConfigForm } from './components/RaceConfigForm';
import { WeekPlanView } from './components/WeekPlanView';
import { PlanOverview } from './components/PlanOverview';
import { TrainingJournal } from './components/TrainingJournal';
import { Analytics } from './components/Analytics';
import { NutritionRecovery } from './components/NutritionRecovery';

const defaultProfile: AthleteProfile = {
  name: '',
  age: 30,
  weight: 75,
  gender: 'male',
  level: 'intermediate',
  weeklyHours: 10,
  trainingDays: 5,
  goalRace: '',
  hrZones: {
    maxHR: 190,
    restHR: 60,
    zone1: { min: 124, max: 143, name: 'Восстановление' },
    zone2: { min: 143, max: 152, name: 'Аэробная' },
    zone3: { min: 152, max: 171, name: 'Темповая' },
    zone4: { min: 171, max: 181, name: 'Пороговая' },
    zone5: { min: 181, max: 190, name: 'VO2max' },
  },
  paceZones: {
    runEasyPace: '6:30',
    runTempoPace: '5:30',
    runThresholdPace: '5:00',
    bikeFTP: 250,
    swimCSS: 120,
  },
  currentFitness: {
    cooperTest: 2800,
    ftp: 250,
    css: 120,
    swim100m: 90,
  },
  dayPreferences: {
    0: ['swim', 'run'],
    1: ['bike'],
    2: ['swim', 'run'],
    3: ['bike', 'run'],
    4: ['swim', 'run'],
    5: ['bike'],
    6: ['run'],
  },
  healthRestrictions: {
    injuries: [],
    allergies: [],
    notes: '',
  },
};

const defaultRaceConfig: RaceConfig = {
  distance: 'olympic',
  weeksToRace: 16,
  raceDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

const defaultBadges: Badge[] = [
  { id: 'first', name: 'Первый шаг', description: 'Первая тренировка в журнале', icon: '🎯', earned: false, requirement: '1 тренировка' },
  { id: 'five', name: 'Пятёрка', description: '5 тренировок в журнале', icon: '⭐', earned: false, requirement: '5 тренировок' },
  { id: 'ten', name: 'Десяточка', description: '10 тренировок в журнале', icon: '🔟', earned: false, requirement: '10 тренировок' },
  { id: 'twentyfive', name: 'Четвертак', description: '25 тренировок в журнале', icon: '💪', earned: false, requirement: '25 тренировок' },
  { id: 'streak3', name: 'Три дня', description: 'Серия 3 дня подряд', icon: '🔥', earned: false, requirement: '3 дня стрик' },
  { id: 'streak7', name: 'Неделя огня', description: 'Серия 7 дней подряд', icon: '🔥', earned: false, requirement: '7 дней стрик' },
  { id: 'hours10', name: '10 часов', description: '10 часов тренировок', icon: '⏱', earned: false, requirement: '10 часов' },
  { id: 'hours50', name: 'Марафонец', description: '50 часов тренировок', icon: '🏅', earned: false, requirement: '50 часов' },
  { id: 'tss500', name: 'Нагрузочник', description: 'Суммарный TSS 500', icon: '📈', earned: false, requirement: 'TSS 500' },
  { id: 'tss2000', name: 'Машина', description: 'Суммарный TSS 2000', icon: '🚀', earned: false, requirement: 'TSS 2000' },
  { id: 'swim5', name: 'Рыба', description: '5 тренировок плавания', icon: '🐟', earned: false, requirement: '5 плаваний' },
  { id: 'bike10', name: 'Километрщик', description: '10 тренировок на велосипеде', icon: '🚴', earned: false, requirement: '10 вело' },
];

function updateBadges(badges: Badge[], log: TrainingLogEntry[]): Badge[] {
  const totalSessions = log.length;
  const totalHours = log.reduce((s, e) => s + e.actualDuration, 0) / 60;
  const totalTSS = log.reduce((s, e) => s + e.tss, 0);
  const swimCount = log.filter(e => e.sport === 'swim').length;
  const bikeCount = log.filter(e => e.sport === 'bike').length;

  // Calculate streak
  let streak = 0;
  if (log.length > 0) {
    const sorted = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    while (true) {
      const hasEntry = sorted.some(e => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      if (hasEntry) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }
  }

  const today = new Date().toISOString().split('T')[0];
  return badges.map(b => {
    if (b.earned) return b;
    let earned = false;
    if (b.id === 'first' && totalSessions >= 1) earned = true;
    if (b.id === 'five' && totalSessions >= 5) earned = true;
    if (b.id === 'ten' && totalSessions >= 10) earned = true;
    if (b.id === 'twentyfive' && totalSessions >= 25) earned = true;
    if (b.id === 'streak3' && streak >= 3) earned = true;
    if (b.id === 'streak7' && streak >= 7) earned = true;
    if (b.id === 'hours10' && totalHours >= 10) earned = true;
    if (b.id === 'hours50' && totalHours >= 50) earned = true;
    if (b.id === 'tss500' && totalTSS >= 500) earned = true;
    if (b.id === 'tss2000' && totalTSS >= 2000) earned = true;
    if (b.id === 'swim5' && swimCount >= 5) earned = true;
    if (b.id === 'bike10' && bikeCount >= 10) earned = true;
    return earned ? { ...b, earned: true, earnedDate: today } : b;
  });
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<AthleteProfile>(defaultProfile);
  const [raceConfig, setRaceConfig] = useState<RaceConfig>(defaultRaceConfig);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [log, setLog] = useState<TrainingLogEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>(defaultBadges);

  const plans: WeekPlan[] = useMemo(() => {
    return generateFullPlan(profile, raceConfig);
  }, [profile, raceConfig]);

  const currentPlan = plans[currentWeek - 1];

  const handleAddEntry = (entry: TrainingLogEntry) => {
    const newLog = [...log, entry];
    setLog(newLog);
    setBadges(updateBadges(badges, newLog));
  };

  const handleDeleteEntry = (id: string) => {
    const newLog = log.filter(e => e.id !== id);
    setLog(newLog);
    setBadges(updateBadges(badges, newLog));
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Профиль', icon: 'fa-user' },
    { id: 'plan', label: 'План', icon: 'fa-calendar-alt' },
    { id: 'journal', label: 'Журнал', icon: 'fa-book' },
    { id: 'analytics', label: 'Аналитика', icon: 'fa-chart-line' },
    { id: 'nutrition', label: 'Питание', icon: 'fa-utensils' },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-base">🏆</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-800">TriPlan</h1>
                <p className="text-[10px] text-gray-400">Тренировочный план для триатлона</p>
              </div>
            </div>

            {/* Tab navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`fas ${tab.icon} text-xs`}></i>
                  {tab.label}
                  {tab.id === 'journal' && log.length > 0 && (
                    <span className="ml-1 bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">{log.length}</span>
                  )}
                  {tab.id === 'analytics' && earnedCount > 0 && (
                    <span className="ml-1 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full">{earnedCount}</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile: badge count */}
            <div className="md:hidden flex items-center gap-2">
              {earnedCount > 0 && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                  🏅 {earnedCount}
                </span>
              )}
            </div>
          </div>

          {/* Mobile tabs */}
          <nav className="md:hidden flex items-center gap-1 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 bg-gray-100'
                }`}
              >
                <i className={`fas ${tab.icon} text-[10px]`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Настройте свой профиль</h2>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Чем точнее данные — тем персонализированнее план
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AthleteProfileForm profile={profile} onChange={setProfile} />
              <div className="space-y-6">
                <RaceConfigForm raceConfig={raceConfig} onChange={setRaceConfig} />
                {/* Quick summary */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-xl">
                  <h3 className="font-bold text-base mb-3">Параметры плана</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-xl font-bold">{raceConfig.weeksToRace}</div>
                      <div className="text-[10px] text-white/70">недель</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-xl font-bold">{profile.weeklyHours}ч</div>
                      <div className="text-[10px] text-white/70">в неделю</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-xl font-bold">{profile.trainingDays}</div>
                      <div className="text-[10px] text-white/70">дней</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-xl font-bold">{Math.round(profile.weeklyHours * raceConfig.weeksToRace)}</div>
                      <div className="text-[10px] text-white/70">всего часов</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Сформировать план <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  План для {profile.name || 'спортсмена'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Подготовка к дистанции «{
                    raceConfig.distance === 'sprint' ? 'Спринт' :
                    raceConfig.distance === 'olympic' ? 'Олимпийская' :
                    raceConfig.distance === 'half_iron' ? '70.3' : 'IRONMAN'
                  }» • Старт: {new Date(raceConfig.raceDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
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

        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Тренировочный журнал</h2>
              <p className="text-gray-500 text-sm mt-1">Записывайте результаты и отслеживайте прогресс</p>
            </div>
            <TrainingJournal
              log={log}
              sessions={currentPlan?.sessions || []}
              onAddEntry={handleAddEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Аналитика и мотивация</h2>
              <p className="text-gray-500 text-sm mt-1">Отслеживайте форму, усталость и достижения</p>
            </div>
            <Analytics
              log={log}
              badges={badges}
              raceDate={raceConfig.raceDate}
              goalRace={profile.goalRace}
            />
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Питание и восстановление</h2>
              <p className="text-gray-500 text-sm mt-1">Рекомендации по питанию и стратегии восстановления</p>
            </div>
            <NutritionRecovery profile={profile} raceConfig={raceConfig} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-gray-400">
          <p>TriPlan — Генератор тренировочных планов для триатлона</p>
          <p className="mt-1">План носит рекомендательный характер. Проконсультируйтесь с тренером.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

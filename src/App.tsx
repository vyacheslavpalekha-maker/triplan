import React, { useState, useMemo } from 'react';
import { AthleteProfile, RaceConfig, WeekPlan, TrainingLogEntry, Badge, Tab } from './types';
import { generateFullPlan } from './planGenerator';
import { analyzeGoalRealism } from './goalAnalyzer';
import { AthleteProfileForm } from './components/AthleteProfileForm';
import { RaceConfigForm } from './components/RaceConfigForm';
import { WeekPlanView } from './components/WeekPlanView';
import { PlanOverview } from './components/PlanOverview';
import { TrainingJournal } from './components/TrainingJournal';
import { Analytics } from './components/Analytics';
import { NutritionRecovery } from './components/NutritionRecovery';
import { StrengthRecovery } from './components/StrengthRecovery';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Toaster } from './components/ui/toaster';

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
    5: [],
    6: [],
  },
  healthRestrictions: {
    injuries: '',
    allergies: '',
    notes: '',
  },
};

const defaultRaceConfig: RaceConfig = {
  distance: 'olympic',
  weeksToRace: 16,
  raceDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  targetTime: '02:30:00',
  targetSwimTime: 1500,
  targetBikeTime: 4500,
  targetRunTime: 3000,
};

const defaultBadges: Badge[] = [
  { id: 'first', name: 'Первый шаг', description: 'Первая тренировка', icon: '🎯', earned: false, requirement: '1 тренировка' },
  { id: 'five', name: 'Пятёрка', description: '5 тренировок', icon: '⭐', earned: false, requirement: '5 тренировок' },
  { id: 'ten', name: 'Десяточка', description: '10 тренировок', icon: '🔟', earned: false, requirement: '10 тренировок' },
  { id: 'twentyfive', name: 'Четвертак', description: '25 тренировок', icon: '💪', earned: false, requirement: '25 тренировок' },
  { id: 'streak3', name: 'Три дня', description: 'Серия 3 дня', icon: '🔥', earned: false, requirement: '3 дня стрик' },
  { id: 'streak7', name: 'Неделя огня', description: 'Серия 7 дней', icon: '🔥', earned: false, requirement: '7 дней стрик' },
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

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<AthleteProfile>(defaultProfile);
  const [raceConfig, setRaceConfig] = useState<RaceConfig>(defaultRaceConfig);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [log, setLog] = useState<TrainingLogEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>(defaultBadges);

  const goalAnalysis = useMemo(() => {
    return analyzeGoalRealism(profile, raceConfig);
  }, [profile, raceConfig]);

  const plans: WeekPlan[] = useMemo(() => {
    return generateFullPlan(profile, raceConfig, goalAnalysis.difficulty);
  }, [profile, raceConfig, goalAnalysis.difficulty]);

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
    { id: 'strength', label: 'Силовая', icon: 'fa-dumbbell' },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header className="header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <span className="text-white text-lg font-bold">T</span>
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>TriPlan</h1>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Тренировочный план для триатлона</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop tabs */}
              <nav className="hidden md:flex items-center gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <i className={`fas ${tab.icon} mr-1.5`}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="theme-toggle" title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
            </div>
          </div>

          {/* Mobile tabs */}
          <nav className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
              >
                <i className={`fas ${tab.icon} mr-1`}></i>
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Настройте свой профиль</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Чем точнее данные — тем персонализированнее план</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AthleteProfileForm profile={profile} onChange={setProfile} />
              <div className="space-y-6">
                <RaceConfigForm raceConfig={raceConfig} onChange={setRaceConfig} profile={profile} />
                <div className="garmin-card p-5">
                  <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Параметры плана</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="stat-card">
                      <div className="stat-value">{raceConfig.weeksToRace}</div>
                      <div className="stat-label">Недель</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{profile.weeklyHours}ч</div>
                      <div className="stat-label">В неделю</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{profile.trainingDays}</div>
                      <div className="stat-label">Дней</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{raceConfig.targetTime || '—'}</div>
                      <div className="stat-label">🎯 Цель</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="garmin-btn w-full"
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
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  План для {profile.name || 'спортсмена'}
                </h2>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Подготовка к дистанции «{
                    raceConfig.distance === 'sprint' ? 'Спринт' :
                    raceConfig.distance === 'olympic' ? 'Олимпийская' :
                    raceConfig.distance === 'half_iron' ? '70.3' : 'IRONMAN'
                  }» • Старт: {new Date(raceConfig.raceDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  {raceConfig.targetTime && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                      🎯 {raceConfig.targetTime}
                    </span>
                  )}
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
                    profile={profile}
                    raceConfig={raceConfig}
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
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Тренировочный журнал</h2>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Записывайте результаты и отслеживайте прогресс</p>
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
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Аналитика и мотивация</h2>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Отслеживайте форму, усталость и достижения</p>
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
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Питание и восстановление</h2>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Рекомендации по питанию и стратегии восстановления</p>
            </div>
            <NutritionRecovery profile={profile} raceConfig={raceConfig} />
          </div>
        )}

        {activeTab === 'strength' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Силовая подготовка и восстановление</h2>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Укрепление мышц, кор, растяжка, баня и массаж</p>
            </div>
            <StrengthRecovery profile={profile} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <p>TriPlan — Генератор тренировочных планов для триатлона</p>
          <p className="mt-1">План носит рекомендательный характер. Проконсультируйтесь с тренером.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

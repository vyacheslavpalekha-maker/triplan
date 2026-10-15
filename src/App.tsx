import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AthleteProfile, RaceConfig, TrainingLogEntry, Badge, Tab } from './types';
import { generateFullPlan } from './planGenerator';
import { analyzeGoalRealism } from './goalAnalyzer';
import { AthleteProfileForm } from './components/AthleteProfileForm';
import { RaceConfigForm } from './components/RaceConfigForm';
import { TodayView } from './components/TodayView';
import { WeekBoard } from './components/WeekBoard';
import { TrainingJournal } from './components/TrainingJournal';
import { NutritionRecovery } from './components/NutritionRecovery';
import { StrengthRecovery } from './components/StrengthRecovery';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Toaster } from './components/ui/toaster';
import { buildBoard, currentPlanWeek, defaultRaceDate, estimateTss, type BoardSession } from './lib/schedule';
import { loadTriPlanState, saveTriPlanState } from './lib/storage';
import { InstallHint } from './components/InstallHint';
import toast from 'react-hot-toast';

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
  raceDate: defaultRaceDate(16),
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

function mergeProfile(saved?: Partial<AthleteProfile>): AthleteProfile {
  if (!saved) return defaultProfile;
  return {
    ...defaultProfile,
    ...saved,
    hrZones: {
      ...defaultProfile.hrZones,
      ...saved.hrZones,
      zone1: { ...defaultProfile.hrZones.zone1, ...saved.hrZones?.zone1 },
      zone2: { ...defaultProfile.hrZones.zone2, ...saved.hrZones?.zone2 },
      zone3: { ...defaultProfile.hrZones.zone3, ...saved.hrZones?.zone3 },
      zone4: { ...defaultProfile.hrZones.zone4, ...saved.hrZones?.zone4 },
      zone5: { ...defaultProfile.hrZones.zone5, ...saved.hrZones?.zone5 },
    },
    paceZones: { ...defaultProfile.paceZones, ...saved.paceZones },
    currentFitness: { ...defaultProfile.currentFitness, ...saved.currentFitness },
    dayPreferences: { ...defaultProfile.dayPreferences, ...saved.dayPreferences },
    healthRestrictions: { ...defaultProfile.healthRestrictions, ...saved.healthRestrictions },
  };
}

function mergeBadges(saved?: Badge[]): Badge[] {
  if (!saved) return defaultBadges;
  return defaultBadges.map((badge) => {
    const previous = saved.find((item) => item.id === badge.id);
    return previous ? { ...badge, earned: previous.earned, earnedDate: previous.earnedDate } : badge;
  });
}

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [saved] = useState(loadTriPlanState);
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [profile, setProfile] = useState<AthleteProfile>(() => mergeProfile(saved?.profile));
  const [raceConfig, setRaceConfig] = useState<RaceConfig>(() => ({ ...defaultRaceConfig, ...saved?.raceConfig }));
  const [currentWeek, setCurrentWeek] = useState(() => currentPlanWeek(
    saved?.raceConfig?.raceDate || defaultRaceConfig.raceDate,
    saved?.raceConfig?.weeksToRace || defaultRaceConfig.weeksToRace,
  ));
  const [log, setLog] = useState<TrainingLogEntry[]>(() => (Array.isArray(saved?.log) ? saved.log : []));
  const [badges, setBadges] = useState<Badge[]>(() => mergeBadges(saved?.badges));
  const [dayOverrides, setDayOverrides] = useState<Record<string, number>>(() => saved?.dayOverrides ?? {});
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveTriPlanState({ profile, raceConfig, log, badges, dayOverrides });
  }, [profile, raceConfig, log, badges, dayOverrides]);

  useEffect(() => {
    setCurrentWeek(currentPlanWeek(raceConfig.raceDate, raceConfig.weeksToRace));
  }, [raceConfig.raceDate, raceConfig.weeksToRace]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || sheetRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  const goalAnalysis = useMemo(() => {
    return analyzeGoalRealism(profile, raceConfig);
  }, [profile, raceConfig]);

  const rawPlans = useMemo(() => {
    return generateFullPlan(profile, raceConfig, goalAnalysis.difficulty);
  }, [profile, raceConfig, goalAnalysis.difficulty]);

  const plans = useMemo(() => buildBoard(rawPlans, dayOverrides), [rawPlans, dayOverrides]);

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

  const handleCompleteSession = (session: BoardSession, weekNumber: number, date: string) => {
    if (log.some(entry => entry.sessionId === session.boardId)) return;
    const entry: TrainingLogEntry = {
      id: `log-${Date.now()}`,
      sessionId: session.boardId,
      date,
      weekNumber,
      sport: session.sport,
      plannedDuration: session.duration,
      actualDuration: session.duration,
      distance: 0,
      avgHR: 0,
      avgPace: session.targetPace,
      rpe: session.intensity === 'hard' ? 8 : session.intensity === 'moderate' ? 6 : session.intensity === 'easy' ? 4 : 3,
      calories: 0,
      tss: estimateTss(session.duration, session.intensity),
      comment: session.description,
      mood: 4,
      sleepHours: 7.5,
      sleepQuality: 4,
      muscleSoreness: 2,
    };
    handleAddEntry(entry);
    toast.success('Тренировка записана в журнал');
  };

  const primaryTabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'today', label: 'Сегодня', icon: 'fa-sun' },
    { id: 'week', label: 'Неделя', icon: 'fa-calendar-week' },
  ];

  const moreTabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Профиль', icon: 'fa-user' },
    { id: 'journal', label: 'Журнал', icon: 'fa-book' },
    { id: 'nutrition', label: 'Питание', icon: 'fa-utensils' },
    { id: 'strength', label: 'Силовая', icon: 'fa-dumbbell' },
  ];

  const moreActive = moreTabs.some(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header className="header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>TriPlan</h1>
                <p className="hidden text-xs sm:block" style={{ color: 'var(--text-tertiary)' }}>Тренировочный план для триатлона</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop tabs */}
              <nav className="hidden md:flex items-center gap-1">
                {primaryTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <i className={`fas ${tab.icon} mr-1.5`}></i>
                    {tab.label}
                  </button>
                ))}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(open => !open)}
                    className={`tab-btn ${moreActive ? 'active' : ''}`}
                  >
                    <i className="fas fa-ellipsis mr-1.5"></i>
                    Ещё
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-xl py-1 shadow-lg"
                      style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                    >
                      {moreTabs.map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                          style={{ color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                        >
                          <i className={`fas ${tab.icon} w-4`}></i>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </nav>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="theme-toggle" title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <InstallHint />
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
                  onClick={() => setActiveTab('week')}
                  className="garmin-btn w-full"
                >
                  Сформировать план <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'today' && (
          <TodayView
            profile={profile}
            raceConfig={raceConfig}
            plans={plans}
            log={log}
            badges={badges}
            goalAnalysis={goalAnalysis}
            onComplete={handleCompleteSession}
            onOpenWeek={(week) => { setCurrentWeek(week); setActiveTab('week'); }}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenJournal={() => setActiveTab('journal')}
          />
        )}

        {activeTab === 'week' && (
          <WeekBoard
            plans={plans}
            weekNumber={Math.min(currentWeek, plans.length) || 1}
            raceConfig={raceConfig}
            profile={profile}
            log={log}
            onWeekChange={setCurrentWeek}
            onMove={(boardId, day) => setDayOverrides(prev => ({ ...prev, [boardId]: day }))}
            onComplete={handleCompleteSession}
          />
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

      <nav className="phone-tabbar fixed inset-x-0 bottom-0 z-40 border-t md:hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        {menuOpen && (
          <div ref={sheetRef} className="absolute bottom-full left-3 right-3 mb-2 rounded-xl py-1 shadow-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            {moreTabs.filter(tab => tab.id !== 'journal').map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm"
                style={{ color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}
              >
                <i className={`fas ${tab.icon} w-4`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-4">
          {primaryTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium"
              style={{ color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
            >
              <i className={`fas ${tab.icon} text-base`}></i>
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setActiveTab('journal'); setMenuOpen(false); }}
            className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium"
            style={{ color: activeTab === 'journal' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
          >
            <i className="fas fa-book text-base"></i>
            Журнал
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setMenuOpen(open => !open)}
            className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium"
            style={{ color: moreActive ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
          >
            <i className="fas fa-ellipsis text-base"></i>
            Ещё
          </button>
        </div>
      </nav>

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

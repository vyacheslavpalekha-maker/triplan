import React, { useState } from 'react';
import { TrainingLogEntry, Sport, TrainingSession } from '../types';

interface Props {
  log: TrainingLogEntry[];
  sessions: TrainingSession[];
  onAddEntry: (entry: TrainingLogEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const SPORT_ICONS: Record<Sport, string> = { swim: '🏊', bike: '🚴', run: '🏃' };
const SPORT_NAMES: Record<Sport, string> = { swim: 'Плавание', bike: 'Велосипед', run: 'Бег' };

export const TrainingJournal: React.FC<Props> = ({ log, sessions, onAddEntry, onDeleteEntry }) => {
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<TrainingLogEntry>>({
    sport: 'run',
    actualDuration: 0,
    distance: 0,
    avgHR: 0,
    avgPace: '',
    rpe: 5,
    calories: 0,
    tss: 0,
    comment: '',
    mood: 3,
    sleepHours: 7,
    sleepQuality: 3,
    muscleSoreness: 2,
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = () => {
    if (!newEntry.actualDuration || !newEntry.sport) return;
    const entry: TrainingLogEntry = {
      id: `log-${Date.now()}`,
      sessionId: '',
      date: newEntry.date || new Date().toISOString().split('T')[0],
      weekNumber: 0,
      sport: newEntry.sport!,
      plannedDuration: 0,
      actualDuration: newEntry.actualDuration!,
      distance: newEntry.distance || 0,
      avgHR: newEntry.avgHR || 0,
      avgPace: newEntry.avgPace || '',
      rpe: newEntry.rpe || 5,
      calories: newEntry.calories || 0,
      tss: newEntry.tss || 0,
      comment: newEntry.comment || '',
      mood: newEntry.mood || 3,
      sleepHours: newEntry.sleepHours || 7,
      sleepQuality: newEntry.sleepQuality || 3,
      muscleSoreness: newEntry.muscleSoreness || 2,
    };
    onAddEntry(entry);
    setShowForm(false);
    setNewEntry({ sport: 'run', actualDuration: 0, distance: 0, avgHR: 0, avgPace: '', rpe: 5, calories: 0, tss: 0, comment: '', mood: 3, sleepHours: 7, sleepQuality: 3, muscleSoreness: 2, date: new Date().toISOString().split('T')[0] });
  };

  const totalTSS = log.reduce((s, e) => s + e.tss, 0);
  const totalHours = log.reduce((s, e) => s + e.actualDuration, 0) / 60;
  const avgRPE = log.length > 0 ? (log.reduce((s, e) => s + e.rpe, 0) / log.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#7B2CBF' }}>{log.length}</div>
          <div className="stat-label">Тренировок</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{totalHours.toFixed(1)}ч</div>
          <div className="stat-label">Общее время</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#E85D04' }}>{totalTSS}</div>
          <div className="stat-label">Суммарный TSS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#F72585' }}>{avgRPE}</div>
          <div className="stat-label">Средний RPE</div>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="garmin-btn w-full flex items-center justify-center gap-2"
      >
        <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
        {showForm ? 'Отмена' : 'Добавить тренировку'}
      </button>

      {/* Form */}
      {showForm && (
        <div className="garmin-card p-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Новая тренировка</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Дата</label>
              <input type="date" value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Вид спорта</label>
              <select value={newEntry.sport}
                onChange={(e) => setNewEntry({ ...newEntry, sport: e.target.value as Sport })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white">
                <option value="swim">🏊 Плавание</option>
                <option value="bike">🚴 Велосипед</option>
                <option value="run">🏃 Бег</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Длительность (мин)</label>
              <input type="number" value={newEntry.actualDuration}
                onChange={(e) => setNewEntry({ ...newEntry, actualDuration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Дистанция (км)</label>
              <input type="number" value={newEntry.distance} step="0.1"
                onChange={(e) => setNewEntry({ ...newEntry, distance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Средняя ЧСС</label>
              <input type="number" value={newEntry.avgHR}
                onChange={(e) => setNewEntry({ ...newEntry, avgHR: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {newEntry.sport === 'swim' ? 'Средний темп (мин/100м)' : 
                 newEntry.sport === 'bike' ? 'Средняя скорость (км/ч)' : 
                 'Средний темп (мин/км)'}
              </label>
              <input type="text" value={newEntry.avgPace}
                onChange={(e) => setNewEntry({ ...newEntry, avgPace: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                placeholder={newEntry.sport === 'swim' ? '2:15' : 
                             newEntry.sport === 'bike' ? '28.5' : 
                             '5:30'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Калории</label>
              <input type="number" value={newEntry.calories}
                onChange={(e) => setNewEntry({ ...newEntry, calories: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">TSS (Training Stress Score)</label>
              <input type="number" value={newEntry.tss}
                onChange={(e) => setNewEntry({ ...newEntry, tss: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>

            {/* RPE */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">RPE (ощущение усилия): {newEntry.rpe}/10</label>
              <input type="range" min={1} max={10} value={newEntry.rpe}
                onChange={(e) => setNewEntry({ ...newEntry, rpe: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Настроение: {newEntry.mood}/5</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(m => (
                  <button key={m} onClick={() => setNewEntry({ ...newEntry, mood: m })}
                    className={`flex-1 py-2 rounded-lg text-lg transition-all ${newEntry.mood === m ? 'bg-purple-100 scale-110' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    {['😫', '😕', '😐', '😊', '🤩'][m - 1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Сон (часов): {newEntry.sleepHours}ч</label>
              <input type="range" min={3} max={12} step={0.5} value={newEntry.sleepHours}
                onChange={(e) => setNewEntry({ ...newEntry, sleepHours: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            </div>

            {/* Muscle soreness */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Боль в мышцах: {newEntry.muscleSoreness}/5</label>
              <input type="range" min={1} max={5} value={newEntry.muscleSoreness}
                onChange={(e) => setNewEntry({ ...newEntry, muscleSoreness: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
            </div>

            {/* Comment */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Комментарий</label>
              <textarea value={newEntry.comment}
                onChange={(e) => setNewEntry({ ...newEntry, comment: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                rows={2} placeholder="Как прошла тренировка? Что было сложно?" />
            </div>
          </div>
          <button onClick={handleSubmit}
            className="garmin-btn mt-4 w-full">
            Сохранить тренировку
          </button>
        </div>
      )}

      {/* Log entries */}
      <div className="space-y-3">
        {log.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
            <i className="fas fa-clipboard-list text-4xl mb-3"></i>
            <p>Журнал пуст. Добавьте первую тренировку!</p>
          </div>
        )}
        {[...log].reverse().map(entry => (
          <div key={entry.id} className="garmin-card p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{SPORT_ICONS[entry.sport]}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{SPORT_NAMES[entry.sport]}</span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{entry.date}</span>
              </div>
              <button onClick={() => onDeleteEntry(entry.id)}
                className="transition-colors"
                style={{ color: 'var(--text-tertiary)' }}>
                <i className="fas fa-trash-alt text-sm"></i>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div><span style={{ color: 'var(--text-tertiary)' }}>Время:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.actualDuration} мин</span></div>
              {entry.distance > 0 && <div><span style={{ color: 'var(--text-tertiary)' }}>Дистанция:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.distance} {entry.sport === 'swim' ? 'м' : 'км'}</span></div>}
              {entry.avgHR > 0 && <div><span style={{ color: 'var(--text-tertiary)' }}>ЧСС:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.avgHR} уд/мин</span></div>}
              {entry.avgPace && <div><span style={{ color: 'var(--text-tertiary)' }}>{entry.sport === 'bike' ? 'Скорость:' : 'Темп:'}</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.avgPace} {entry.sport === 'swim' ? 'мин/100м' : entry.sport === 'bike' ? 'км/ч' : 'мин/км'}</span></div>}
              <div><span style={{ color: 'var(--text-tertiary)' }}>RPE:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.rpe}/10</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>TSS:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.tss}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Настроение:</span> <span>{['😫', '😕', '😐', '😊', '🤩'][entry.mood - 1]}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Сон:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.sleepHours}ч</span></div>
            </div>
            {entry.comment && (
              <p className="text-sm mt-2 italic" style={{ color: 'var(--text-secondary)' }}>«{entry.comment}»</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

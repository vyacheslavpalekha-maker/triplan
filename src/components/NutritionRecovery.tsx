import React from 'react';
import { AthleteProfile, RaceConfig, Distance } from '../types';

interface Props {
  profile: AthleteProfile;
  raceConfig: RaceConfig;
}

function calculateCalories(profile: AthleteProfile, weeklyHours: number): { calories: number; protein: number; carbs: number; fat: number } {
  const bmr = profile.gender === 'male'
    ? 88.362 + (13.397 * profile.weight) + (4.799 * profile.age * 10) - (5.677 * profile.age)
    : 447.593 + (9.247 * profile.weight) + (3.098 * profile.age * 10) - (4.330 * profile.age);

  const activityCalories = weeklyHours * 500; // ~500 kcal per training hour
  const totalCalories = Math.round(bmr + activityCalories / 7);
  const protein = Math.round(profile.weight * 1.6); // 1.6g/kg
  const fat = Math.round(totalCalories * 0.25 / 9); // 25% from fat
  const carbs = Math.round((totalCalories - protein * 4 - fat * 9) / 4);

  return { calories: totalCalories, protein, carbs, fat };
}

function getRaceDayPlan(distance: Distance) {
  const plans: Record<Distance, { time: string; meal: string; calories: number; notes: string }[]> = {
    sprint: [
      { time: 'За 3 часа', meal: 'Завтрак: овсянка + банан + мёд', calories: 500, notes: 'Легкоусвояемые углеводы' },
      { time: 'За 1 час', meal: 'Тост с джемом + изотоник', calories: 200, notes: 'Не экспериментировать с новым!' },
      { time: 'Во время', meal: 'Изотоник + 1 гель', calories: 150, notes: 'Каждые 20 мин по глотку' },
      { time: 'После финиша', meal: 'Восстановительный коктейль + банан', calories: 300, notes: 'В течение 30 мин после финиша' },
    ],
    olympic: [
      { time: 'За 3 часа', meal: 'Завтрак: рис + яйца + авокадо', calories: 600, notes: 'Сложные углеводы + белок' },
      { time: 'За 1 час', meal: 'Белый хлеб + мёд + банан', calories: 250, notes: 'Минимум клетчатки' },
      { time: 'На вело', meal: '2 геля + изотоник 500мл', calories: 300, notes: 'По 1 гелю каждые 30 мин' },
      { time: 'На бег', meal: '1 гель + вода', calories: 100, notes: 'На 5-м км' },
      { time: 'После финиша', meal: 'Шоколадное молоко + бутерброд', calories: 400, notes: 'Восстановление в течение 30 мин' },
    ],
    half_iron: [
      { time: 'За 3 часа', meal: 'Завтрак: большая порция овсянки + яйца + фрукт', calories: 700, notes: 'Основной приём пищи' },
      { time: 'За 1 час', meal: 'Белый тост + мёд + банан', calories: 300, notes: 'Лёгкие углеводы' },
      { time: 'На вело (каждые 30мин)', meal: 'Гель + изотоник + батончик', calories: 600, notes: '60-90г углеводов/час' },
      { time: 'На бег', meal: '2 геля + кола на пункте', calories: 200, notes: 'Кофеин на 15-м км' },
      { time: 'После финиша', meal: 'Полноценный приём пищи', calories: 600, notes: 'Белок + углеводы + овощи' },
    ],
    ironman: [
      { time: 'За 3 часа', meal: 'Завтрак: рис/овсянка + яйца + тост с джемом', calories: 800, notes: 'Максимальная загрузка' },
      { time: 'За 1 час', meal: 'Банан + белый хлеб + мёд', calories: 300, notes: 'Только простые углеводы' },
      { time: 'На плавание', meal: '—', calories: 0, notes: 'Гидратация перед стартом' },
      { time: 'На вело (каждые 20мин)', meal: 'Гель/батончик + изотоник + твёрдая пища', calories: 1200, notes: '60-90г углеводов/час. Чередовать!' },
      { time: 'На бег (каждые 5км)', meal: 'Гель + кола + вода', calories: 400, notes: 'Кофеин после 30 км бега' },
      { time: 'После финиша', meal: 'Праздничный ужин!', calories: 1000, notes: 'Вы это заслужили! 🎉' },
    ],
  };
  return plans[distance];
}

export const NutritionRecovery: React.FC<Props> = ({ profile, raceConfig }) => {
  const macros = calculateCalories(profile, profile.weeklyHours);
  const raceDayPlan = getRaceDayPlan(raceConfig.distance);

  const hydration = Math.round(profile.weight * 35 + profile.weeklyHours * 500); // ml

  return (
    <div className="space-y-6">
      {/* Daily macros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <i className="fas fa-utensils text-sm"></i>
          </span>
          Ежедневная норма КБЖУ
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{macros.calories}</div>
            <div className="text-xs text-orange-500">ккал/день</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{macros.protein}г</div>
            <div className="text-xs text-red-500">Белки</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{macros.carbs}г</div>
            <div className="text-xs text-yellow-500">Углеводы</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{macros.fat}г</div>
            <div className="text-xs text-blue-500">Жиры</div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Рассчитано на основе веса {profile.weight}кг и {profile.weeklyHours}ч тренировок/нед. В дни тяжёлых тренировок увеличьте углеводы на 20-30%.
        </p>
      </div>

      {/* Hydration */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
            <i className="fas fa-droplet text-sm"></i>
          </span>
          Гидратация
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl font-bold text-sky-600">{(hydration / 1000).toFixed(1)}л</div>
          <div className="text-sm text-gray-500">ежедневная потребность в жидкости</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-sky-50 rounded-lg p-3">
            <div className="text-sm font-medium text-sky-700">До тренировки</div>
            <div className="text-xs text-sky-600">500мл за 2 часа до</div>
          </div>
          <div className="bg-sky-50 rounded-lg p-3">
            <div className="text-sm font-medium text-sky-700">Во время</div>
            <div className="text-xs text-sky-600">150-250мл каждые 15-20 мин</div>
          </div>
          <div className="bg-sky-50 rounded-lg p-3">
            <div className="text-sm font-medium text-sky-700">После</div>
            <div className="text-xs text-sky-600">1.5л на каждый кг потерянного веса</div>
          </div>
        </div>
      </div>

      {/* Pre/During/Post workout */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <i className="fas fa-clock text-sm"></i>
          </span>
          Питание вокруг тренировки
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🟢</span>
            <div>
              <div className="font-medium text-sm text-green-800">За 2-3 часа до тренировки</div>
              <div className="text-xs text-green-600">Сложные углеводы + немного белка: овсянка с бананом, рис с курицей, паста</div>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">🟡</span>
            <div>
              <div className="font-medium text-sm text-yellow-800">За 30 мин до</div>
              <div className="text-xs text-yellow-600">Быстрые углеводы: банан, тост с мёдом, энергетический батончик</div>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">🟠</span>
            <div>
              <div className="font-medium text-sm text-orange-800">Во время (если &gt;60 мин)</div>
              <div className="text-xs text-orange-600">30-60г углеводов/час: гели, изотоник, банан, финики</div>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🔵</span>
            <div>
              <div className="font-medium text-sm text-blue-800">В течение 30 мин после</div>
              <div className="text-xs text-blue-600">Белок + углеводы (1:3): шоколадное молоко, протеиновый коктейль + фрукт</div>
            </div>
          </div>
        </div>
      </div>

      {/* Race Day Plan */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-700">
            <i className="fas fa-flag-checkered text-sm"></i>
          </span>
          План питания на день гонки
        </h3>
        <div className="space-y-3">
          {raceDayPlan.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
              <div className="w-16 text-xs font-bold text-orange-600 shrink-0">{item.time}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{item.meal}</div>
                <div className="text-xs text-gray-500">{item.notes}</div>
              </div>
              <div className="text-sm font-bold text-orange-500">{item.calories > 0 ? `${item.calories} ккал` : ''}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-white/50 rounded-xl">
          <p className="text-xs text-orange-700">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            <strong>Важно:</strong> Никогда не пробуйте новое питание на гонке! Тестируйте всё на тренировках.
          </p>
        </div>
      </div>

      {/* Recovery */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <i className="fas fa-bed text-sm"></i>
          </span>
          Восстановление
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl">
            <div className="font-medium text-indigo-800 mb-2">😴 Сон</div>
            <ul className="text-xs text-indigo-600 space-y-1">
              <li>• 7-9 часов — золотой стандарт</li>
              <li>• Ложиться и вставать в одно время</li>
              <li>• Прохладная тёмная комната</li>
              <li>• Без экранов за 1 час до сна</li>
            </ul>
          </div>
          <div className="p-4 bg-pink-50 rounded-xl">
            <div className="font-medium text-pink-800 mb-2">🧘 Активное восстановление</div>
            <ul className="text-xs text-pink-600 space-y-1">
              <li>• Йога / растяжка 15-20 мин</li>
              <li>• Foam roller — 10 мин на группы мышц</li>
              <li>• Лёгкое плавание в день отдыха</li>
              <li>• Прогулка 30-40 мин</li>
            </ul>
          </div>
          <div className="p-4 bg-teal-50 rounded-xl">
            <div className="font-medium text-teal-800 mb-2">💊 Добавки (рекомендации)</div>
            <ul className="text-xs text-teal-600 space-y-1">
              <li>• Витамин D — 2000-4000 МЕ/день</li>
              <li>• Железо — по анализу крови</li>
              <li>• Магний — 400мг перед сном</li>
              <li>• Омега-3 — 2-3г/день</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="font-medium text-amber-800 mb-2">⚠️ Признаки перетренированности</div>
            <ul className="text-xs text-amber-600 space-y-1">
              <li>• Утренний пульс выше на 5+ уд/мин</li>
              <li>• Постоянная усталость и раздражительность</li>
              <li>• Снижение результатов</li>
              <li>• Частые простуды</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

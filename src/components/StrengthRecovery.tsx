import React from 'react';
import { AthleteProfile } from '../types';

interface Props {
  profile: AthleteProfile;
}

export const StrengthRecovery: React.FC<Props> = ({ profile }) => {
  return (
    <div className="space-y-6">
      {/* Силовая подготовка */}
      <div className="garmin-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(123, 44, 191, 0.1)', color: '#7B2CBF' }}>
            💪
          </span>
          Силовая подготовка
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Силовые тренировки 2 раза в неделю помогают предотвратить травмы, улучшить экономичность движений и увеличить мощность.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-semibold text-purple-800 mb-2">🦵 Низ тела (Вт)</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Приседания: 3-4×8-12</li>
              <li>• Выпады: 3×12 на ногу</li>
              <li>• Становая тяга: 3-4×8-12</li>
              <li>• Подъём на носки: 3×15</li>
              <li>• Ягодичный мост: 3×15</li>
            </ul>
            <p className="text-xs text-purple-600 mt-2 italic">
              Фокус: беговая мощность, профилактика травм коленей и бёдер
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-semibold text-purple-800 mb-2">💪 Верх тела (Пт)</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Отжимания: 3-4×8-12</li>
              <li>• Подтягивания/тяга блока: 3-4×8-12</li>
              <li>• Жим гантелей: 3×8-12</li>
              <li>• Тяга гантели в наклоне: 3×8-12</li>
              <li>• Планка: 3×45сек</li>
            </ul>
            <p className="text-xs text-purple-600 mt-2 italic">
              Фокус: плавательная мощность, стабильность на велосипеде
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-100 rounded-xl">
          <p className="text-xs text-purple-800">
            <strong>💡 Рекомендации:</strong> Начинайте с лёгких весов, фокусируйтесь на технике. 
            Избегайте силовых тренировок за 48 часов до длительных сессий.
          </p>
        </div>
      </div>

      {/* Укрепление кора */}
      <div className="garmin-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 12, 163, 0.1)', color: '#3A0CA3' }}>
            🎯
          </span>
          Укрепление кора (2-3 раза в неделю)
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Сильный кор — основа эффективного плавания, стабильной посадки на велосипеде и экономичного бега.
        </p>

        <div className="bg-indigo-50 rounded-xl p-4">
          <h4 className="font-semibold text-indigo-800 mb-3">Комплекс упражнений (20 минут, 3 круга):</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-indigo-700">
            <div>• Планка: 45сек</div>
            <div>• Боковая планка: 30сек/сторону</div>
            <div>• Мёртвый жук: 12 повторений</div>
            <div>• Супермен: 12 повторений</div>
            <div>• Русский твист: 20 повторений</div>
            <div>• Птица-собака: 10/сторону</div>
          </div>
          <p className="text-xs text-indigo-600 mt-3 italic">
            Отдых между кругами: 60сек. Фокус на качестве выполнения, а не скорости.
          </p>
        </div>
      </div>

      {/* Растяжка и мобильность */}
      <div className="garmin-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(247, 37, 133, 0.1)', color: '#F72585' }}>
            🧘
          </span>
          Растяжка и мобильность
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Регулярная растяжка улучшает диапазон движений, снижает риск травм и ускоряет восстановление.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-3">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">🏊 После плавания</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Плечи (рука за голову)</li>
              <li>• Грудные мышцы</li>
              <li>• Широчайшие</li>
              <li>• Трицепс</li>
              <li>• Спина (поза ребёнка)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-xl p-3">
            <h4 className="font-semibold text-green-800 text-sm mb-2">🚴 После велосипеда</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Квадрицепсы (стоя)</li>
              <li>• Бицепс бедра (наклоны)</li>
              <li>• Икры (у стены)</li>
              <li>• Поясница (кошка-корова)</li>
              <li>• Сгибатели бедра</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-xl p-3">
            <h4 className="font-semibold text-red-800 text-sm mb-2">🏃 После бега</h4>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Квадрицепсы</li>
              <li>• Бицепс бедра</li>
              <li>• Икры</li>
              <li>• Ягодицы (figure 4)</li>
              <li>• Спина и плечи</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-pink-100 rounded-xl">
          <p className="text-xs text-pink-800">
            <strong>💡 Правила растяжки:</strong> Удерживайте каждое положение 30-45 секунд. 
            Растягивайтесь до ощущения натяжения, но не боли. 10-15 минут после каждой тренировки.
          </p>
        </div>
      </div>

      {/* Баня и массаж */}
      <div className="garmin-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}>
            🧖
          </span>
          Восстановление: баня и массаж
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50 rounded-xl p-4">
            <h4 className="font-semibold text-amber-800 mb-2">🔥 Баня/сауна</h4>
            <ul className="text-xs text-amber-700 space-y-2">
              <li><strong>Частота:</strong> 1 раз в неделю (в день отдыха)</li>
              <li><strong>Температура:</strong> 70-90°C (сауна) или 50-60°C (баня)</li>
              <li><strong>Время:</strong> 3 захода по 10-15 минут</li>
              <li><strong>Перерыв:</strong> 15-20 минут между заходами</li>
              <li><strong>Важно:</strong> Пейте воду до, во время и после</li>
            </ul>
            <p className="text-xs text-amber-600 mt-2 italic">
              Польза: улучшение кровообращения, выведение токсинов, расслабление мышц
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-4">
            <h4 className="font-semibold text-amber-800 mb-2">💆 Массаж</h4>
            <ul className="text-xs text-amber-700 space-y-2">
              <li><strong>Спортивный массаж:</strong> 1 раз в 2 недели</li>
              <li><strong>Самомассаж (foam roller):</strong> ежедневно 10-15 мин</li>
              <li><strong>Фокус:</strong> ноги, спина, плечи</li>
              <li><strong>Техника:</strong> медленные движения, задержка на болезненных точках 30сек</li>
            </ul>
            <p className="text-xs text-amber-600 mt-2 italic">
              Польза: снятие мышечного напряжения, улучшение мобильности, ускорение восстановления
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-100 rounded-xl">
          <p className="text-xs text-amber-800">
            <strong>⚠️ Важно:</strong> Избегайте бани и глубокого массажа за 48 часов до важных тренировок или соревнований.
          </p>
        </div>
      </div>

      {/* Дополнительные рекомендации */}
      <div className="garmin-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 150, 136, 0.1)', color: '#009688' }}>
            📋
          </span>
          Дополнительные рекомендации
        </h3>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-teal-50 rounded-xl">
            <span className="text-xl">🧊</span>
            <div>
              <div className="font-medium text-sm text-teal-800">Контрастный душ</div>
              <div className="text-xs text-teal-600">Чередование горячей (1-2 мин) и холодной (30 сек) воды. 3-5 циклов. Улучшает кровообращение и восстановление.</div>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-teal-50 rounded-xl">
            <span className="text-xl">🦶</span>
            <div>
              <div className="font-medium text-sm text-teal-800">Катание на мячике</div>
              <div className="text-xs text-teal-600">Используйте теннисный мячик для массажа стоп, икр, ягодиц. 5-10 минут ежедневно. Снимает напряжение в мелких мышцах.</div>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-teal-50 rounded-xl">
            <span className="text-xl">🧘‍♂️</span>
            <div>
              <div className="font-medium text-sm text-teal-800">Йога</div>
              <div className="text-xs text-teal-600">1 раз в неделю (в день отдыха). Улучшает гибкость, баланс, дыхание. Фокус на позах воина, собаки мордой вниз, голубя.</div>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-teal-50 rounded-xl">
            <span className="text-xl">😴</span>
            <div>
              <div className="font-medium text-sm text-teal-800">Сон</div>
              <div className="text-xs text-teal-600">7-9 часов nightly. Добавляйте 30-60 минут сна в дни тяжёлых тренировок. Сон — главный инструмент восстановления.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

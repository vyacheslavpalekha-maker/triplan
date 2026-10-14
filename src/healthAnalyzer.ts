import { AthleteProfile, HealthRestrictions } from './types';

export interface HealthRecommendation {
  type: 'warning' | 'info' | 'adjustment';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  adjustments: string[];
}

// Ключевые слова для анализа
const KEYWORDS = {
  hip: ['тазобедрен', 'бедр', 'hip', 'протез', 'эндопротез', 'сустав'],
  knee: ['колен', 'knee', 'мениск', 'связк'],
  shoulder: ['плеч', 'shoulder', 'ротатор', 'манжет'],
  back: ['спин', 'back', 'позвон', 'грыж', 'протруз'],
  ankle: ['голеностоп', 'ankle', 'ступн'],
  heart: ['сердц', 'heart', 'карди', 'ишем'],
  hypertension: ['гипертон', 'давлен', 'hypertension', 'hypertens'],
  asthma: ['астм', 'asthma'],
  diabetes: ['диабет', 'diabet'],
};

function containsKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

export function analyzeHealthRestrictions(profile: AthleteProfile): HealthRecommendation[] {
  const recommendations: HealthRecommendation[] = [];
  const { injuries, allergies, notes } = profile.healthRestrictions;
  const allText = `${injuries} ${allergies} ${notes}`.toLowerCase();

  // Анализ тазобедренного сустава
  if (containsKeywords(allText, KEYWORDS.hip)) {
    recommendations.push({
      type: 'warning',
      severity: 'high',
      title: '⚠️ Тазобедренный сустав',
      description: 'Обнаружены ограничения, связанные с тазобедренным суставом. Требуется особая осторожность при беговых нагрузках.',
      adjustments: [
        '🏃 Снизить объём бега на 20-30%',
        '🚴 Увеличить долю велосипеда (щадящий для сустава)',
        '🏊 Акцент на плавание (разгрузка сустава)',
        '🚫 Избегать бега по неровным поверхностям',
        '👟 Использовать обувь с максимальной амортизацией',
        '🔄 Заменить часть беговых тренировок на эллипс/акваджоггинг',
      ],
    });
  }

  // Анализ коленей
  if (containsKeywords(allText, KEYWORDS.knee)) {
    recommendations.push({
      type: 'warning',
      severity: 'medium',
      title: '⚠️ Коленный сустав',
      description: 'Обнаружены ограничения коленного сустава. Беговые нагрузки требуют контроля.',
      adjustments: [
        '🏃 Ограничить бег по асфальту, предпочитать грунт/дорожку',
        '📉 Снизить объём интервального бега',
        '🚴 Увеличить велосипед (при правильной посадке щадит колени)',
        '💪 Добавить укрепление квадрицепсов и мышц бедра',
        '🧘 Обязательная растяжка и работа с foam roller',
      ],
    });
  }

  // Анализ плеч
  if (containsKeywords(allText, KEYWORDS.shoulder)) {
    recommendations.push({
      type: 'warning',
      severity: 'medium',
      title: '⚠️ Плечевой сустав',
      description: 'Обнаружены ограничения плеча. Плавание требует модификации.',
      adjustments: [
        '🏊 Снизить объём плавания, увеличить долю техники',
        '🔄 Использовать альтернативные стили (на спине вместо кроля)',
        '💪 Укреплять мышцы ротаторной манжеты',
        '🚫 Избегать «через не могу» в плавании',
        '🏥 Консультация спортивного врача перед интенсивными нагрузками',
      ],
    });
  }

  // Анализ спины
  if (containsKeywords(allText, KEYWORDS.back)) {
    recommendations.push({
      type: 'warning',
      severity: 'medium',
      title: '⚠️ Проблемы со спиной',
      description: 'Обнаружены ограничения позвоночника. Ударные нагрузки требуют осторожности.',
      adjustments: [
        '🏃 Ограничить бег, заменить на велосипед/плавание',
        '🚴 Проверить правильность посадки на велосипеде',
        '🏊 Плавание на спине предпочтительнее',
        '💪 Обязательно укрепление кора (core)',
        '🧘 Ежедневная растяжка и упражнения на мобильность',
      ],
    });
  }

  // Анализ гипертонии
  if (containsKeywords(allText, KEYWORDS.hypertension)) {
    recommendations.push({
      type: 'warning',
      severity: 'high',
      title: '⚠️ Гипертония',
      description: 'Обнаружена гипертония. Требуется контроль ЧСС и избежание пиковых нагрузок.',
      adjustments: [
        '❤️ Строгий контроль ЧСС — не превышать зону 3',
        '🚫 Избегать длительных интервалов в зоне 4-5',
        '💊 Контроль давления до и после тренировки',
        '🩺 Обязательная консультация кардиолога',
        '🌡️ Избегать тренировок в жару и на высоте',
        '📊 Вести дневник давления',
      ],
    });
  }

  // Анализ сердца
  if (containsKeywords(allText, KEYWORDS.heart) && !containsKeywords(allText, KEYWORDS.hypertension)) {
    recommendations.push({
      type: 'warning',
      severity: 'high',
      title: '⚠️ Сердечно-сосудистые ограничения',
      description: 'Обнаружены сердечно-сосудистые ограничения. Требуется медицинский контроль.',
      adjustments: [
        '🩺 Обязательное обследование у кардиолога',
        '❤️ Тренировки только в зонах 1-2',
        '📊 Постоянный мониторинг ЧСС',
        '🚫 Запрет на соревновательный темп без разрешения врача',
        '🆘 Иметь при себе лекарства и контакты врача',
      ],
    });
  }

  // Анализ астмы
  if (containsKeywords(allText, KEYWORDS.asthma)) {
    recommendations.push({
      type: 'info',
      severity: 'medium',
      title: '💨 Астма',
      description: 'Обнаружена астма. Требуется контроль при нагрузках на холодном воздухе.',
      adjustments: [
        '🌬️ Избегать тренировок на холодном воздухе',
        '💨 Иметь ингалятор при себе',
        '🏊 Плавание — идеальный вид (тёплый влажный воздух)',
        '📈 Постепенное увеличение нагрузки',
        '🌡️ Разминка не менее 15 минут',
      ],
    });
  }

  // Анализ диабета
  if (containsKeywords(allText, KEYWORDS.diabetes)) {
    recommendations.push({
      type: 'info',
      severity: 'medium',
      title: '🩸 Диабет',
      description: 'Обнаружен диабет. Требуется контроль уровня глюкозы.',
      adjustments: [
        '🍬 Контроль глюкозы до/во время/после тренировки',
        '🍌 Всегда иметь быстрые углеводы при себе',
        '💉 Корректировка инсулина по согласованию с врачом',
        '📊 Вести дневник глюкозы и нагрузок',
        '🚰 Увеличить потребление жидкости',
      ],
    });
  }

  // Общие рекомендации, если есть любые ограничения
  if (allText.trim().length > 10 && recommendations.length === 0) {
    recommendations.push({
      type: 'info',
      severity: 'low',
      title: 'ℹ️ Учтены ваши ограничения',
      description: 'Рекомендуем обсудить тренировочный план с врачом или спортивным специалистом.',
      adjustments: [
        '🩺 Консультация со спортивным врачом',
        '📈 Постепенное увеличение нагрузки',
        '👂 Прислушиваться к сигналам тела',
        '📝 Вести дневник самочувствия',
      ],
    });
  }

  return recommendations;
}

export function getPlanAdjustments(profile: AthleteProfile): {
  runMultiplier: number;
  bikeMultiplier: number;
  swimMultiplier: number;
  maxIntensity: 'easy' | 'moderate' | 'hard';
} {
  const allText = `${profile.healthRestrictions.injuries} ${profile.healthRestrictions.allergies} ${profile.healthRestrictions.notes}`.toLowerCase();

  let runMultiplier = 1.0;
  let bikeMultiplier = 1.0;
  let swimMultiplier = 1.0;
  let maxIntensity: 'easy' | 'moderate' | 'hard' = 'hard';

  // Тазобедренный сустав — снижаем бег, увеличиваем вело/плавание
  if (containsKeywords(allText, KEYWORDS.hip)) {
    runMultiplier = 0.7;
    bikeMultiplier = 1.2;
    swimMultiplier = 1.1;
  }

  // Колени — снижаем бег
  if (containsKeywords(allText, KEYWORDS.knee)) {
    runMultiplier = Math.min(runMultiplier, 0.8);
    bikeMultiplier = Math.max(bikeMultiplier, 1.1);
  }

  // Плечи — снижаем плавание
  if (containsKeywords(allText, KEYWORDS.shoulder)) {
    swimMultiplier = 0.7;
  }

  // Спина — снижаем бег
  if (containsKeywords(allText, KEYWORDS.back)) {
    runMultiplier = Math.min(runMultiplier, 0.6);
    bikeMultiplier = Math.max(bikeMultiplier, 1.2);
  }

  // Гипертония — ограничиваем интенсивность
  if (containsKeywords(allText, KEYWORDS.hypertension)) {
    maxIntensity = 'moderate';
  }

  // Сердце — строгое ограничение интенсивности
  if (containsKeywords(allText, KEYWORDS.heart)) {
    maxIntensity = 'easy';
  }

  return { runMultiplier, bikeMultiplier, swimMultiplier, maxIntensity };
}

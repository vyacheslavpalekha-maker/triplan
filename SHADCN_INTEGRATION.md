# shadcn/ui Integration Guide

## 📦 Установленные компоненты

В проект интегрирована библиотека **shadcn/ui** со следующими компонентами:

### Базовые компоненты
- **Button** - кнопки с вариантами (default, destructive, outline, secondary, ghost, link)
- **Input** - поля ввода
- **Card** - карточки (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **Badge** - бейджи/метки
- **Label** - лейблы для форм

### Компоненты для форм
- **Select** - выпадающие списки
- **Switch** - переключатели
- **Slider** - слайдеры
- **Checkbox** - чекбоксы (через @radix-ui/react-checkbox)

### Компоненты для отображения
- **Dialog** - модальные окна
- **Tabs** - вкладки
- **Tooltip** - подсказки
- **Progress** - прогресс-бары
- **Separator** - разделители

### Утилиты
- **Toaster** - уведомления (react-hot-toast)
- **cn()** - утилита для объединения CSS классов

## 🎨 Использование

### Импорт компонентов

```typescript
import { Button, Card, Input, Badge, Dialog } from './components/ui';
```

### Примеры использования

#### Button
```tsx
<Button variant="default">Обычная кнопка</Button>
<Button variant="destructive">Удалить</Button>
<Button variant="outline">Вторичная</Button>
<Button variant="ghost">Призрак</Button>
<Button size="sm">Маленькая</Button>
<Button size="lg">Большая</Button>
```

#### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Заголовок карточки</CardTitle>
    <CardDescription>Описание карточки</CardDescription>
  </CardHeader>
  <CardContent>
    Содержимое карточки
  </CardContent>
  <CardFooter>
    <Button>Действие</Button>
  </CardFooter>
</Card>
```

#### Dialog (Модальное окно)
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заголовок модалки</DialogTitle>
      <DialogDescription>Описание действия</DialogDescription>
    </DialogHeader>
    <div>Содержимое модалки</div>
  </DialogContent>
</Dialog>
```

#### Tabs (Вкладки)
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
    <TabsTrigger value="tab2">Вкладка 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Содержимое вкладки 1</TabsContent>
  <TabsContent value="tab2">Содержимое вкладки 2</TabsContent>
</Tabs>
```

#### Select (Выпадающий список)
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Выберите опцию" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Опция 1</SelectItem>
    <SelectItem value="option2">Опция 2</SelectItem>
  </SelectContent>
</Select>
```

#### Progress (Прогресс-бар)
```tsx
import { Progress } from './components/ui';

<Progress value={75} />
```

#### Badge (Метка)
```tsx
import { Badge } from './components/ui';

<Badge variant="default">Обычный</Badge>
<Badge variant="secondary">Вторичный</Badge>
<Badge variant="destructive">Важный</Badge>
<Badge variant="outline">Контурный</Badge>
```

#### Tooltip (Подсказка)
```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Наведи на меня</TooltipTrigger>
    <TooltipContent>Подсказка</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Уведомления (Toasts)
```tsx
import toast from 'react-hot-toast';

// Успешное уведомление
toast.success('Операция выполнена!');

// Ошибка
toast.error('Произошла ошибка');

// Кастомное уведомление
toast('Сообщение', {
  icon: '🎉',
  style: {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
});
```

## 🎨 Темизация

Все компоненты автоматически поддерживают светлую и тёмную темы через CSS переменные:

```css
:root {
  --primary: var(--accent-primary);
  --secondary: var(--bg-tertiary);
  --muted: var(--bg-tertiary);
  --accent: var(--bg-tertiary);
  --destructive: var(--error);
  --border: var(--border-color);
  --ring: var(--accent-primary);
}
```

## 🛠 Утилита cn()

Для объединения CSS классов используйте утилиту `cn()`:

```typescript
import { cn } from './lib/utils';

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  className
)} />
```

## 📚 Документация

Полная документация shadcn/ui: https://ui.shadcn.com/docs

## 🎯 Следующие шаги

1. Заменить существующие кастомные компоненты на shadcn/ui
2. Добавить больше интерактивности с Dialog и Tooltip
3. Использовать Tabs для навигации
4. Добавить Progress для визуализации прогресса
5. Использовать Toast для уведомлений

## 💡 Преимущества

✅ Готовые доступные компоненты (a11y)  
✅ Полная кастомизация через Tailwind CSS  
✅ Поддержка тем из коробки  
✅ Модульная архитектура  
✅ Активное сообщество и документация  
✅ TypeScript из коробки

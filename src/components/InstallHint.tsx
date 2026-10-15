import React, { useEffect, useState } from 'react';

const DISMISS_KEY = 'triplan-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
}

export const InstallHint: React.FC = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => {
    if (window.self !== window.top || isStandalone()) return true;
    return localStorage.getItem(DISMISS_KEY) === '1';
  });

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setHidden(true);
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') dismiss();
    setPromptEvent(null);
  };

  return (
    <div className="garmin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>TriPlan на экран «Домой»</div>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isIos()
            ? 'Нажмите «Поделиться», затем «На экран Домой». План будет открываться как приложение.'
            : 'Установите ярлык, чтобы открывать сегодняшнюю тренировку в одно касание.'}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {promptEvent && (
          <button type="button" onClick={install} className="garmin-btn">
            Установить
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          Позже
        </button>
      </div>
    </div>
  );
};

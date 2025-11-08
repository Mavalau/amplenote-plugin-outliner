import { App } from '../typing/amplenote-plugin-types';

// Default color-mode is "dark" if unset
export function getColorMode(app: App): 'light' | 'dark' {
  const raw = app?.settings?.['color-mode'];
  const defaultColorMode = 'dark';
  return String(raw).toLowerCase() === 'light' ? 'light' : defaultColorMode;
}

export function getPollingInterval(app: App): number {
  const pollingIntervalMs = app?.settings?.['polling-interval'];
  const pollingIntervalMsNum = Number(pollingIntervalMs);
  const defaultPollingIntervalMs = 1000;
  return isFinite(pollingIntervalMsNum) && pollingIntervalMsNum > 0
    ? pollingIntervalMsNum
    : defaultPollingIntervalMs;
}

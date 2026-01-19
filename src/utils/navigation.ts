import { App } from '../typing/amplenote-plugin-types';

export function isViewingDailyJots(app: App): boolean {
  const url = String(app?.context?.url || '');
  return /\/notes\/jots\b/i.test(url);
}

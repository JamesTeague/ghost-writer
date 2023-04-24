import { Stoolie } from 'stoolie/dist/logger';
import { Watcher } from '../types';

export const createWatchAction =
  (watcher: Watcher, logger: Stoolie) =>
  async (intervalMs: number, rssFeed: string) => {
    const log = logger.withFields({ rssFeed, intervalMs });
    log.verbose('Track command called.');
    log.info('Watching for new posts...');
    await watcher.watch({ rssFeed, frequencyMs: intervalMs });
  };

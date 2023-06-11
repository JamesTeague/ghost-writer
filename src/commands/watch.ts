import { Watcher } from '../types';

export const createWatchAction =
  (watcher: Watcher) =>
    async (intervalMs: number, rssFeed: string) => {
      console.log('Watch command called.', { rssFeed, intervalMs });
      console.info('Watching for new posts...');
      await watcher.watch({ rssFeed, frequencyMs: intervalMs });
    };

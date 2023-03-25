import { parse } from 'rss-to-json';
import { Feed } from '../types';
import { Stoolie } from 'stoolie/dist/logger';

export const createFindAction = (logger: Stoolie) => {
  return async (rssFeed: string, title: string) => {
    const log = logger.withFields({ title, rssFeed });

    log.info('Looking for episode.');
    const feed: Feed = await parse(rssFeed);
    const post = feed.items.find((item) => item.title === title);

    post
      ? log.withFields({ ...post }).info('Found Post:')
      : log.warn('Post Not Found!');
  };
};

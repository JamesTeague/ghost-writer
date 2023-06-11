import { parse } from 'rss-to-json';
import { Feed } from '../types';

export const createFindAction = () => {
  return async (title: string, rssFeed: string) => {
    console.info('Looking for episode.', { title, rssFeed });
    const feed: Feed = await parse(rssFeed);
    const post = feed.items.find((item) => item.title === title);

    post
      ? console.info('Found Post:', { ...post })
      : console.warn('Post Not Found!');
  };
};

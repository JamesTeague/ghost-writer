import { parse } from 'rss-to-json';
import { Feed, Publisher } from '../types';

export const createPublishAction = (publisher: Publisher) => {
  return async (rssFeed: string) => {
    console.log('Publish command called.', { rssFeed });
    console.info('Getting episodes from rss feed...');
    const { link, items }: Feed = await parse(rssFeed);

    console.info('Publishing posts...');
    await Promise.all(
      items.map((item) => {
        return publisher.publish({ showLink: link, item, tags: ['Podcast'] });
      })
    );

    console.info('Published posts!');
  };
};

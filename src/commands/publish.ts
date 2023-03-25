import { parse } from 'rss-to-json';
import { Feed, Publisher } from '../types';
import { Stoolie } from 'stoolie/dist/logger';

export const createPublishAction = (publisher: Publisher, logger: Stoolie) => {
  return async (rssFeed: string) => {
    const log = logger.withFields({ rssFeed });
    log.info('Publish command called.');
    log.verbose('Getting episodes from rss feed...');
    const { link, items }: Feed = await parse(rssFeed);

    log.info('Publishing posts...');
    await Promise.all(
      items.map((item) => {
        return publisher.publish({ showLink: link, item, tags: ['Podcast']});
      })
    );

    log.info('Published posts!');
  };
};

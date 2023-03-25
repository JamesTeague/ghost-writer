import { interval, Subscription, Subject } from 'rxjs';
import * as RxOp from 'rxjs/operators';
import {
  Feed,
  PodcastItem,
  Post,
  Publisher,
  Watcher,
  WatchRequest,
} from '../types';
import { parse } from 'rss-to-json';
import { Stoolie } from 'stoolie/dist/logger';

export const createWatcher = (
  client: any,
  publisher: Publisher,
  logger: Stoolie
): Watcher => {
  return {
    watch: watch(client, publisher, logger),
  };
};

const watch =
  (client: any, publisher: Publisher, logger: Stoolie) =>
  async ({ rssFeed, frequencyMs }: WatchRequest): Promise<Subscription> => {
    const mostRecentPost = await getMostRecentPost(client);
    const lastReadDate = new Date(mostRecentPost.published_at);

    const log = logger.withFields({ lastReadDate: lastReadDate.toISOString() });
    let showLink: string;

    const exit = new Subject();
    ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
      process.on(signal, () => exit.next(true));
    });

    return interval(frequencyMs)
      .pipe(
        RxOp.takeUntil(exit),
        RxOp.mergeMap(() => parse(rssFeed)),
        RxOp.tap(({ link }) => {
          showLink = link;
        }),
        RxOp.map(({ items }: Feed) => items),
        RxOp.mergeMap((items) => items),
        RxOp.filter(
          ({ published }) =>
            new Date(published).toISOString() > lastReadDate.toISOString()
        ),
        RxOp.tap(({ title, published }) =>
          log
            .withFields({ title, published: new Date(published).toISOString() })
            .info('Publishing Post.')
        ),
        RxOp.mergeMap((item: PodcastItem) =>
          publisher.publish({ showLink, item, tags: ['Podcast'] })
        )
      )
      .subscribe({
        next() {},
        error(error: Error) {
          logger.withError(error).error('Fatal application error.');
        },
        complete() {
          logger.info('Application exited normally.');
        },
      });
  };

const getMostRecentPost = async (client: any): Promise<Post> => {
  return (await client.posts.browse({ limit: 1 }))[0];
};

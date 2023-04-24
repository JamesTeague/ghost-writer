import { interval, Subject, Subscription } from 'rxjs';
import * as RxOp from 'rxjs/operators';
import { Feed, PodcastItem, Publisher, Watcher, WatchRequest } from '../types';
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
    let lastReadDate: Date;
    let showLink: string;
    const log = logger;

    const exit = new Subject();
    ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
      process.on(signal, () => exit.next(true));
    });

    return interval(frequencyMs)
      .pipe(
        RxOp.takeUntil(exit),
        RxOp.mergeMap(() => getMostRecentPostDate(client)),
        RxOp.tap((mostRecentPostDate) => {
          lastReadDate = mostRecentPostDate;
        }),
        RxOp.tap(() => {
          log.withFields({ lastReadDate }).info('Checking for new posts...');
        }),
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
          log.withError(error).error('Fatal application error.');
        },
        complete() {
          log.info('Application exited normally.');
        },
      });
  };

const getMostRecentPostDate = async (client: any): Promise<Date> => {
  const mostRecentPost = (await client.posts.browse({ limit: 1 }))[0];
  return new Date(mostRecentPost.published_at);
};

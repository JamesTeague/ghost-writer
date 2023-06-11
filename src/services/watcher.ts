import { interval, Subject, Subscription } from 'rxjs';
import * as RxOp from 'rxjs/operators';
import { Feed, PodcastItem, Publisher, Watcher, WatchRequest } from '../types';
import { parse } from 'rss-to-json';

export const createWatcher = (
  client: any,
  publisher: Publisher,
): Watcher => {
  return {
    watch: watch(client, publisher),
  };
};

const watch =
  (client: any, publisher: Publisher) =>
    async ({ rssFeed, frequencyMs }: WatchRequest): Promise<Subscription> => {
      let lastReadDate: Date;
      let showLink: string;

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
            console.log('Checking for new posts...', { lastReadDate });
          }),
          RxOp.mergeMap(() => parse(rssFeed)),
          RxOp.tap(({ link }) => {
            showLink = link;
          }),
          RxOp.map(({ items }: Feed) => items),
          RxOp.mergeMap((items) => items),
          RxOp.filter(
            ({ published }) =>
              new Date(published).getTime() > lastReadDate.getTime()
          ),
          RxOp.tap(({ title, published }) =>
            console.log('Publishing Post.', { title, published: new Date(published).toISOString() })
          ),
          RxOp.mergeMap((item: PodcastItem) =>
            publisher.publish({ showLink, item, tags: ['Podcast'] })
          )
        )
        .subscribe({
          next() { },
          error(error: Error) {
            console.error(error, 'Fatal application error');
          },
          complete() {
            console.info('Application exited normally.');
          },
        });
    };

const getMostRecentPostDate = async (client: any): Promise<Date> => {
  const mostRecentPost = (await client.posts.browse({ limit: 1, sort: 'published_at DESC', filter: 'tag:podcast' }))[0];
  return new Date(mostRecentPost.published_at);
};

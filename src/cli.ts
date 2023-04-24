import { createCommand, InvalidArgumentError, program } from 'commander';
import stoolie, { LogLevel } from 'stoolie';
import {
  createDeleteAction,
  createFindAction,
  createPublishAction,
  createWatchAction,
} from './commands';
import { createPublisher, createWatcher } from './services';

const GhostAdminAPI = require('@tryghost/admin-api');
const publishCommand = createCommand('publish');
const deleteCommand = createCommand('delete');
const findCommand = createCommand('find');
const watchCommand = createCommand('watch');

const logger = stoolie(LogLevel.INFO);
const ensureRequiredValues = () => {
  const log = logger.withFields({
    required: {
      GHOST_URL: process.env.GHOST_URL,
      GHOST_API_KEY: !!process.env.GHOST_API_KEY,
      RSS_FEED: process.env.RSS_FEED,
    },
    optional: {
      LOGO_URL: process.env.LOGO_URL,
      POLLING_INTERVAL: process.env.POLLING_INTERVAL,
    },
  });

  log.info('Checking required values.');

  if (
    !process.env.GHOST_URL ||
    !process.env.GHOST_API_KEY ||
    !process.env.RSS_FEED
  ) {
    log.error('Missing required variable.');
    process.exit(9);
  }

  if (!process.env.LOGO_URL || !process.env.POLLING_INTERVAL) {
    log.warn('Missing optional variable.');
  }
};

ensureRequiredValues();

const client = new GhostAdminAPI({
  url: process.env.GHOST_URL,
  version: 'v5.0',
  key: process.env.GHOST_API_KEY,
});

const RSS_FEED = process.env.RSS_FEED;

const publisher = createPublisher(client);
const watcher = createWatcher(client, publisher, logger);

const parseIntervalFromArgument = (value: string = '60') => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }

  return parsedValue * 60000;
};

deleteCommand
  .description('Remove posts from all past episodes')
  .option('--all')
  .action(createDeleteAction(publisher, logger));

publishCommand
  .description('Create posts from all past episodes and publish them')
  .option('--all')
  .argument('[rssFeed]', 'Feed to Podcast', RSS_FEED)
  .action(createPublishAction(publisher, logger));

findCommand
  .description('Find post by title')
  .argument('<title>', 'Name of episode')
  .argument('[rssFeed]', 'Feed to Podcast', RSS_FEED)
  .action(createFindAction(logger));

watchCommand
  .description('Watch Rss Feed for new episodes and publish them as posts')
  .argument(
    '<intervalMs>',
    'interval to fetch in milliseconds',
    parseIntervalFromArgument(process.env.POLLING_INTERVAL)
  )
  .argument('[rssFeed]', 'Feed to Podcast', RSS_FEED)
  .action(createWatchAction(watcher, logger));

program
  .name('ghost-writer')
  .description('CLI to manage posts on a Ghost blog')
  .version('1.0.3')
  .addCommand(publishCommand)
  .addCommand(deleteCommand)
  .addCommand(findCommand)
  .addCommand(watchCommand);

program.parse();

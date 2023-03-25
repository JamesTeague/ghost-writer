import { program, createCommand, InvalidArgumentError } from 'commander';
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

const client = new GhostAdminAPI({
  url: process.env.GHOST_URL,
  version: 'v5.0',
  key: process.env.GHOST_API_KEY,
});

const publisher = createPublisher(client);

const logger = stoolie(LogLevel.INFO);

const watcher = createWatcher(client, publisher, logger);

const parseIntFromArgument = (value: string) => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }
  return parsedValue;
};

deleteCommand
  .description('Remove posts from all past episodes')
  .option('--all')
  .action(createDeleteAction(publisher, logger));

publishCommand
  .description('Create posts from all past episodes and publish them')
  .option('--all')
  .argument('<rssFeed>', 'Feed to Podcast')
  .action(createPublishAction(publisher, logger));

findCommand
  .description('Find post by title')
  .argument('<rssFeed>', 'Feed to Podcast')
  .argument('<title>', 'Name of episode')
  .action(createFindAction(logger));

watchCommand
  .description('Watch Rss Feed for new episodes and publish them as posts')
  .argument('<rssFeed>', 'Feed to Podcast')
  .argument(
    '<intervalMs>',
    'interval to fetch in milliseconds',
    parseIntFromArgument
  )
  .action(createWatchAction(watcher, logger));

program
  .name('ghost-writer')
  .description('CLI to manage posts on a Ghost blog')
  .version('0.0.1')
  .addCommand(publishCommand)
  .addCommand(deleteCommand)
  .addCommand(findCommand)
  .addCommand(watchCommand);

program.parse();

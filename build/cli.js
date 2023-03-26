"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const stoolie_1 = __importStar(require("stoolie"));
const commands_1 = require("./commands");
const services_1 = require("./services");
const GhostAdminAPI = require('@tryghost/admin-api');
const publishCommand = (0, commander_1.createCommand)('publish');
const deleteCommand = (0, commander_1.createCommand)('delete');
const findCommand = (0, commander_1.createCommand)('find');
const watchCommand = (0, commander_1.createCommand)('watch');
const client = new GhostAdminAPI({
    url: process.env.GHOST_URL,
    version: 'v5.0',
    key: process.env.GHOST_API_KEY,
});
const publisher = (0, services_1.createPublisher)(client);
const logger = (0, stoolie_1.default)(stoolie_1.LogLevel.INFO);
const watcher = (0, services_1.createWatcher)(client, publisher, logger);
const parseIntFromArgument = (value) => {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new commander_1.InvalidArgumentError('Not a number.');
    }
    return parsedValue;
};
deleteCommand
    .description('Remove posts from all past episodes')
    .option('--all')
    .action((0, commands_1.createDeleteAction)(publisher, logger));
publishCommand
    .description('Create posts from all past episodes and publish them')
    .option('--all')
    .argument('<rssFeed>', 'Feed to Podcast')
    .action((0, commands_1.createPublishAction)(publisher, logger));
findCommand
    .description('Find post by title')
    .argument('<rssFeed>', 'Feed to Podcast')
    .argument('<title>', 'Name of episode')
    .action((0, commands_1.createFindAction)(logger));
watchCommand
    .description('Watch Rss Feed for new episodes and publish them as posts')
    .argument('<rssFeed>', 'Feed to Podcast')
    .argument('<intervalMs>', 'interval to fetch in milliseconds', parseIntFromArgument)
    .action((0, commands_1.createWatchAction)(watcher, logger));
commander_1.program
    .name('ghost-writer')
    .description('CLI to manage posts on a Ghost blog')
    .version('0.0.1')
    .addCommand(publishCommand)
    .addCommand(deleteCommand)
    .addCommand(findCommand)
    .addCommand(watchCommand);
commander_1.program.parse();

import { Stoolie } from 'stoolie/dist/logger';
import { Publisher } from '../types';

export const createDeleteAction = (publisher: Publisher, logger: Stoolie) => {
  return async () => {
    logger.info("Deleting all posts tagged with 'Podcast'...");

    await publisher.deleteAll({ tags: ['podcast'] });

    logger.info('Deleted posts!');
  };
};

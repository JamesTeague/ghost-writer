import { Stoolie } from 'stoolie/dist/logger';
import { Publisher } from '../types';

export const createDeleteAction = (publisher: Publisher, logger: Stoolie) => {
  return async () => {
    logger.info("Deleting all posts tagged with 'Episodes'...");

    await publisher.deleteAll({ tags: ['episodes'] });

    logger.info('Deleted posts!');
  };
};

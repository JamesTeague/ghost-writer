import { Publisher } from '../types';

export const createDeleteAction = (publisher: Publisher) => {
  return async () => {
    console.info("Deleting all posts tagged with 'Podcast'...");

    await publisher.deleteAll({ tags: ['podcast'] });

    console.info('Deleted posts!');
  };
};

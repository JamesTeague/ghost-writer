import { Enclosure, Post } from './types';

export const extractBuzzsproutNumericalId = ({ url }: Enclosure) => {
  const uri = new URL(url);

  return uri.pathname.split('/')[2].split('-')[0];
};

export const enclosedTitleForEmbed = ({ url }: Enclosure) => {
  return url.substring(0, url.length - 4);
};

export const filterFooter = (description: string) => {
  let excerpt = description.split('</p>')[0].replace('<p>', '');

  const trimIndex = excerpt.indexOf('Thanks for listening!');

  excerpt = trimIndex > -1 ? excerpt.substring(0, trimIndex) : excerpt;

  if (excerpt.length > 300) {
    excerpt = excerpt.substring(0, 297).concat('...');
  }
  return excerpt;
};

export const filterPostsByTag = (posts: Post[], tag: string): Post[] => {
  return posts.filter((post) =>
    post.tags.filter((postTag) => postTag.name == tag)
  );
};

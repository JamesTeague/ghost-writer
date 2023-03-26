"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterPostsByTag = exports.filterFooter = exports.enclosedTitleForEmbed = exports.extractBuzzsproutNumericalId = void 0;
const extractBuzzsproutNumericalId = ({ url }) => {
    const uri = new URL(url);
    return uri.pathname.split('/')[2].split('-')[0];
};
exports.extractBuzzsproutNumericalId = extractBuzzsproutNumericalId;
const enclosedTitleForEmbed = ({ url }) => {
    return url.substring(0, url.length - 4);
};
exports.enclosedTitleForEmbed = enclosedTitleForEmbed;
const filterFooter = (description) => {
    let excerpt = description.split('</p>')[0].replace('<p>', '');
    const trimIndex = excerpt.indexOf('Thanks for listening!');
    excerpt = trimIndex > -1 ? excerpt.substring(0, trimIndex) : excerpt;
    if (excerpt.length > 300) {
        excerpt = excerpt.substring(0, 297).concat('...');
    }
    return excerpt;
};
exports.filterFooter = filterFooter;
const filterPostsByTag = (posts, tag) => {
    return posts.filter((post) => post.tags.filter((postTag) => postTag.name == tag));
};
exports.filterPostsByTag = filterPostsByTag;

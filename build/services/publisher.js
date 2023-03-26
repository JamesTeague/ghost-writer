"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublisher = void 0;
const utilities_1 = require("../utilities");
const createPublisher = (client) => {
    return {
        publish: publish(client),
        deleteAll: deleteAll(client),
    };
};
exports.createPublisher = createPublisher;
const publish = (client) => ({ showLink, item, tags }) => __awaiter(void 0, void 0, void 0, function* () {
    const html = createEmbed(showLink, item);
    return client.posts.add({
        title: item.title,
        html,
        custom_excerpt: (0, utilities_1.filterFooter)(item.description),
        published_at: new Date(item.published).toISOString(),
        tags: tags ? tags : [],
        feature_image: process.env.LOGO_URL,
        status: 'published',
    }, { source: 'html' });
});
const deleteAll = (client) => ({ tags }) => __awaiter(void 0, void 0, void 0, function* () {
    let posts = yield client.posts.browse({ limit: 300 });
    let postsToDelete = [];
    if (tags && tags.length) {
        postsToDelete = tags.reduce((acc, tag) => {
            return acc.concat(...(0, utilities_1.filterPostsByTag)(posts, tag));
        }, []);
    }
    yield Promise.all(postsToDelete.map(({ id }) => {
        client.posts.delete({ id });
    }));
});
const createEmbed = (showLink, { enclosures }) => {
    const enclosure = enclosures.find((e) => e.type === 'audio/mpeg');
    const extractedId = (0, utilities_1.extractBuzzsproutNumericalId)(enclosure);
    const divId = `buzzsprout-player-${extractedId}`;
    const enclosedTitle = (0, utilities_1.enclosedTitleForEmbed)(enclosure);
    return `<!--kg-card-begin: html-->
            <div id="${divId}"></div><script src="${enclosedTitle}.js?container_id=${divId}&player=small" type="text/javascript" charset="utf-8"></script>
            <!--kg-card-end: html-->`;
};

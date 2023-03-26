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
exports.createPublishAction = void 0;
const rss_to_json_1 = require("rss-to-json");
const createPublishAction = (publisher, logger) => {
    return (rssFeed) => __awaiter(void 0, void 0, void 0, function* () {
        const log = logger.withFields({ rssFeed });
        log.info('Publish command called.');
        log.verbose('Getting episodes from rss feed...');
        const { link, items } = yield (0, rss_to_json_1.parse)(rssFeed);
        log.info('Publishing posts...');
        yield Promise.all(items.map((item) => {
            return publisher.publish({ showLink: link, item, tags: ['Podcast'] });
        }));
        log.info('Published posts!');
    });
};
exports.createPublishAction = createPublishAction;

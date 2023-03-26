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
exports.createFindAction = void 0;
const rss_to_json_1 = require("rss-to-json");
const createFindAction = (logger) => {
    return (rssFeed, title) => __awaiter(void 0, void 0, void 0, function* () {
        const log = logger.withFields({ title, rssFeed });
        log.info('Looking for episode.');
        const feed = yield (0, rss_to_json_1.parse)(rssFeed);
        const post = feed.items.find((item) => item.title === title);
        post
            ? log.withFields(Object.assign({}, post)).info('Found Post:')
            : log.warn('Post Not Found!');
    });
};
exports.createFindAction = createFindAction;

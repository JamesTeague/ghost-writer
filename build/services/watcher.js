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
exports.createWatcher = void 0;
const rxjs_1 = require("rxjs");
const RxOp = __importStar(require("rxjs/operators"));
const rss_to_json_1 = require("rss-to-json");
const createWatcher = (client, publisher, logger) => {
    return {
        watch: watch(client, publisher, logger),
    };
};
exports.createWatcher = createWatcher;
const watch = (client, publisher, logger) => ({ rssFeed, frequencyMs }) => __awaiter(void 0, void 0, void 0, function* () {
    const mostRecentPost = yield getMostRecentPost(client);
    const lastReadDate = new Date(mostRecentPost.published_at);
    const log = logger.withFields({ lastReadDate: lastReadDate.toISOString() });
    let showLink;
    const exit = new rxjs_1.Subject();
    ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
        process.on(signal, () => exit.next(true));
    });
    return (0, rxjs_1.interval)(frequencyMs)
        .pipe(RxOp.takeUntil(exit), RxOp.mergeMap(() => (0, rss_to_json_1.parse)(rssFeed)), RxOp.tap(({ link }) => {
        showLink = link;
    }), RxOp.map(({ items }) => items), RxOp.mergeMap((items) => items), RxOp.filter(({ published }) => new Date(published).toISOString() > lastReadDate.toISOString()), RxOp.tap(({ title, published }) => log
        .withFields({ title, published: new Date(published).toISOString() })
        .info('Publishing Post.')), RxOp.mergeMap((item) => publisher.publish({ showLink, item, tags: ['Podcast'] })))
        .subscribe({
        next() { },
        error(error) {
            logger.withError(error).error('Fatal application error.');
        },
        complete() {
            logger.info('Application exited normally.');
        },
    });
});
const getMostRecentPost = (client) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield client.posts.browse({ limit: 1 }))[0];
});

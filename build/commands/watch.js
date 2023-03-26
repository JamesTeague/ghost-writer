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
exports.createWatchAction = void 0;
const createWatchAction = (watcher, logger) => (rssFeed, intervalMs) => __awaiter(void 0, void 0, void 0, function* () {
    const log = logger.withFields({ rssFeed, intervalMs });
    log.verbose('Track command called.');
    log.info('Watching for new posts...');
    yield watcher.watch({ rssFeed, frequencyMs: intervalMs });
});
exports.createWatchAction = createWatchAction;

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
exports.PlayerController = void 0;
class PlayerController {
    constructor(spotifyService, slackService, store) {
        this.spotifyService = spotifyService;
        this.slackService = slackService;
        this.store = store;
    }
    hydrateAccessToken() {
        if (this.store.has('slackAccessToken')) {
            this.slackService.setAccessToken(this.store.get('slackAccessToken'));
        }
    }
    updateIfNewTrack() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isIncognito()) {
                return false;
            }
            let wasUpdated = false;
            const currentTrack = yield this.spotifyService.getTrackAndArtist();
            if (currentTrack &&
                this.spotifyService.isNewTrackPlaying(currentTrack) &&
                this.isUserAuthenticated()) {
                this.spotifyService.setLastTrack(currentTrack);
                const formattedTrackAndArtist = this.spotifyService.getFormattedTrack();
                yield this.slackService.postMessage(formattedTrackAndArtist);
                wasUpdated = true;
            }
            return wasUpdated;
        });
    }
    isUserAuthenticated() {
        return !!this.store.get('slackAccessToken');
    }
    exchangeUserCodeForAccessToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slackAccessToken, userData } = yield this.slackService.exchangeCodeForAccessToken(code);
            this.store.set('slackAccessToken', slackAccessToken);
            this.store.set('slackUserData', userData);
            return userData;
        });
    }
    fetchUserData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = yield this.slackService.fetchUserData(userId);
            this.store.set('slackUserData', userData);
            return userData;
        });
    }
    getCurrentlyPlayingTrack() {
        return this.spotifyService.getLastTrack();
    }
    isIncognito() {
        if (!this.store.has('isIncognito')) {
            this.store.set('isIncognito', false);
        }
        return !!this.store.get('isIncognito');
    }
    getUserData() {
        if (this.store.has('slackUserData')) {
            return this.store.get('slackUserData');
        }
    }
    getPlayerPreferences() {
        return {
            isIncognito: this.isIncognito()
        };
    }
    setPlayerPreference(key, value) {
        this.store.set(key, value);
    }
}
exports.PlayerController = PlayerController;
//# sourceMappingURL=PlayerController.js.map
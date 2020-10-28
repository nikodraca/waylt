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
exports.SlackService = void 0;
const axios_1 = require("axios");
const qs = require("query-string");
class SlackService {
    constructor() {
        this.slackAccessToken = undefined;
        this.userData = undefined;
    }
    exchangeCodeForAccessToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI } = process.env;
            const query = qs.stringify({
                code,
                client_id: SLACK_CLIENT_ID,
                client_secret: SLACK_CLIENT_SECRET,
                redirect_uri: SLACK_REDIRECT_URI
            });
            const res = yield axios_1.default.get(`https://slack.com/api/oauth.access?${query}`);
            if (res.data.ok === true) {
                this.setAccessToken(res.data.access_token);
                const { user_id, team_id, team_name } = res.data;
                const slackUserData = {
                    userId: user_id,
                    teamId: team_id,
                    teamName: team_name
                };
                this.userData = slackUserData;
                if (this.slackAccessToken && this.userData) {
                    return {
                        slackAccessToken: this.slackAccessToken,
                        userData: this.userData
                    };
                }
            }
            throw new Error('Unable to authorize user');
        });
    }
    setAccessToken(accessToken) {
        this.slackAccessToken = accessToken;
    }
    fetchUserData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = qs.stringify({
                user: userId
            });
            const res = yield axios_1.default.get(`https://slack.com/api/users.info?${query}`, {
                headers: { Authorization: `Bearer ${this.slackAccessToken}` }
            });
            if (res.data.ok === true) {
                const { real_name, image_192 } = res.data.user.profile;
                if (this.userData) {
                    this.userData.userName = real_name;
                    this.userData.userAvatar = image_192;
                    return this.userData;
                }
            }
            throw new Error('Unable to fetch user data');
        });
    }
    postMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios_1.default.post(`https://slack.com/api/users.profile.set`, {
                profile: {
                    status_text: message,
                    status_emoji: ':musical_note:',
                    status_expiration: 0
                }
            }, {
                headers: { Authorization: `Bearer ${this.slackAccessToken}` }
            });
        });
    }
}
exports.SlackService = SlackService;
//# sourceMappingURL=SlackService.js.map
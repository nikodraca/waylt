import axios from 'axios';
import * as qs from 'query-string';
import ElectronStore = require('electron-store');
import { SlackUserData } from '../types';

export class SlackService {
  private slackAccessToken?: string;
  private store: ElectronStore;
  private userData: SlackUserData;

  constructor(store: ElectronStore) {
    this.store = store;

    const slackAccessToken = this.store.get('slackAccessToken');
    if (slackAccessToken) {
      this.slackAccessToken = slackAccessToken as string;
    }
  }

  async exchangeCodeForAccessToken(code: string): Promise<SlackUserData> {
    const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI } = process.env;

    const query = qs.stringify({
      code,
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      redirect_uri: SLACK_REDIRECT_URI
    });

    const res = await axios.get(`https://slack.com/api/oauth.access?${query}`);

    if (res.data.ok === true) {
      this.slackAccessToken = res.data.access_token;
      this.store.set('slackAccessToken', this.slackAccessToken);

      const { user_id, team_id, team_name } = res.data;
      const slackUserData = {
        userId: user_id,
        teamId: team_id,
        teamName: team_name
      };

      this.userData = slackUserData;
      this.store.set('slackUserData', this.userData);

      return this.userData;
    }

    throw new Error('Unable to authorize user');
  }

  async fetchUserData(userId: string): Promise<SlackUserData> {
    if (this.isAuthenticated()) {
      const query = qs.stringify({
        user: userId
      });

      const res = await axios.get(`https://slack.com/api/users.info?${query}`, {
        headers: { Authorization: `Bearer ${this.slackAccessToken}` }
      });

      if (res.data.ok === true) {
        const { real_name, image_192 } = res.data.user.profile;

        this.userData.userName = real_name;
        this.userData.userAvatar = image_192;

        this.store.set('slackUserData.userName', this.userData.userName);
        this.store.set('slackUserData.userAvatar', this.userData.userAvatar);
      }

      return this.userData;
    }
  }

  isAuthenticated(): boolean {
    return !!this.slackAccessToken;
  }

  async postMessage(message: string) {
    if (this.isAuthenticated()) {
      await axios.post(
        `https://slack.com/api/users.profile.set`,
        {
          profile: {
            status_text: message,
            status_emoji: ':musical_note:',
            status_expiration: 0
          }
        },
        {
          headers: { Authorization: `Bearer ${this.slackAccessToken}` }
        }
      );
    }
  }
}

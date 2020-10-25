import axios from 'axios';
import * as qs from 'query-string';
import ElectronStore = require('electron-store');

export class SlackService {
  private slackAccessToken?: string;
  private store: ElectronStore;

  constructor(store: ElectronStore) {
    this.store = store;

    const slackAccessToken = this.store.get('slackAccessToken');
    if (slackAccessToken) {
      this.slackAccessToken = slackAccessToken as string;
    }
  }

  async exchangeCodeForAccessToken(code: string) {
    const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI } = process.env;

    const query = qs.stringify({
      code,
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      redirect_uri: SLACK_REDIRECT_URI
    });

    const res = await axios.get(`https://slack.com/api/oauth.access?${query}`);

    this.slackAccessToken = res.data.access_token;
    this.store.set('slackAccessToken', this.slackAccessToken);
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
//

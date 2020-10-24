import axios from 'axios';
import * as qs from 'query-string';

export class SlackService {
  accessToken?: string;

  constructor() {}

  async exchangeCodeForAccessToken(code: string) {
    const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI } = process.env;

    const query = qs.stringify({
      code,
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      redirect_uri: SLACK_REDIRECT_URI
    });

    const res = await axios.get(`https://slack.com/api/oauth.access?${query}`);

    this.accessToken = res.data.access_token;
  }

  async postMessage(message: string) {
    if (this.accessToken) {
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
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
    }
  }
}
//

import axios from 'axios';
import * as qs from 'query-string';
import { SlackUserData } from '../types';

export class SlackService {
  private slackAccessToken: string | undefined;
  private userData: SlackUserData | undefined;

  constructor() {
    this.slackAccessToken = undefined;
    this.userData = undefined;
  }

  async exchangeCodeForAccessToken(
    code: string
  ): Promise<{ slackAccessToken: string; userData: SlackUserData }> {
    const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI } = process.env;

    const query = qs.stringify({
      code,
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      redirect_uri: SLACK_REDIRECT_URI
    });

    const res = await axios.get(`https://slack.com/api/oauth.access?${query}`);

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
  }

  setAccessToken(accessToken: string) {
    this.slackAccessToken = accessToken;
  }

  async fetchUserData(userId: string): Promise<SlackUserData> {
    const query = qs.stringify({
      user: userId
    });

    const res = await axios.get(`https://slack.com/api/users.info?${query}`, {
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
  }

  async postMessage(message: string) {
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

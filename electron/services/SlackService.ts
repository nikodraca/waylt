import axios from 'axios';
import * as qs from 'query-string';

import { SlackUserData } from '../types';
import { AuthService } from './AuthService';

export class SlackService {
  private authService: AuthService;
  private slackAccessToken: string | undefined;
  private userData: SlackUserData | undefined;

  constructor(authService: AuthService) {
    this.slackAccessToken = undefined;
    this.userData = undefined;
    this.authService = authService;
  }

  async exchangeCodeForAccessToken(
    code: string
  ): Promise<{ slackAccessToken: string; userData: SlackUserData }> {
    const { userId, teamId, teamName, accessToken } = await this.authService.getAuthData(code);

    if (!accessToken) {
      throw new Error('Unable to authorize user');
    }

    this.setAccessToken(accessToken);
    this.userData = { userId, teamId, teamName };

    return {
      slackAccessToken: accessToken,
      userData: {
        userId,
        teamId,
        teamName
      }
    };
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

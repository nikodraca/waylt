import axios from 'axios';
import log from 'electron-log';

import { SlackUserData, SlackCodeExchangeResponse } from '../types';
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

  async exchangeCodeForAccessToken(code: string): Promise<SlackCodeExchangeResponse | undefined> {
    try {
      const { userId, teamId, accessToken } = await this.authService.getAuthData(code);

      if (!accessToken) {
        throw new Error('Unable to authorize user');
      }

      this.setAccessToken(accessToken);
      this.userData = { userId, teamId };

      return {
        slackAccessToken: accessToken,
        userData: {
          userId,
          teamId
        }
      };
    } catch (err) {
      log.error(err);
    }
  }

  setAccessToken(accessToken: string) {
    this.slackAccessToken = accessToken;
  }

  async fetchUserData(): Promise<SlackUserData | undefined> {
    try {
      const res = await axios.get(`https://slack.com/api/users.profile.get`, {
        headers: { Authorization: `Bearer ${this.slackAccessToken}` }
      });

      if (!res.data.ok) {
        throw new Error(JSON.stringify(res.data));
      }

      const { real_name, image_72 } = res.data.profile;

      if (this.userData) {
        this.userData.userName = real_name;
        this.userData.userAvatar = image_72;

        return this.userData;
      }
    } catch (err) {
      log.error(err);
    }
  }

  async fetchTeamData() {
    try {
      const res = await axios.get(`https://slack.com/api/team.info`, {
        headers: { Authorization: `Bearer ${this.slackAccessToken}` }
      });

      if (!res.data.ok) {
        throw new Error(JSON.stringify(res.data));
      }

      const { name } = res.data.team;

      if (this.userData) {
        this.userData.teamName = name;
      }

      return this.userData;
    } catch (err) {
      log.error(err);
    }
  }

  async postStatus(message: string) {
    try {
      const res = await axios.post(
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

      if (!res.data.ok) {
        throw new Error(JSON.stringify(res.data));
      }
    } catch (err) {
      log.error(err);
    }
  }

  async unsetStatus() {
    try {
      const res = await axios.post(
        `https://slack.com/api/users.profile.set`,
        {
          profile: {
            status_text: '',
            status_emoji: ''
          }
        },
        {
          headers: { Authorization: `Bearer ${this.slackAccessToken}` }
        }
      );

      if (!res.data.ok) {
        throw new Error(JSON.stringify(res.data));
      }
    } catch (err) {
      log.error(err);
    }
  }
}

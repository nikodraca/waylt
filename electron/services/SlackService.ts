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
  }

  setAccessToken(accessToken: string) {
    this.slackAccessToken = accessToken;
  }

  async fetchUserData(): Promise<SlackUserData> {
    const res = await axios.get(`https://slack.com/api/users.identity`, {
      headers: { Authorization: `Bearer ${this.slackAccessToken}` }
    });

    if (res.data.ok === true) {
      const { name, image_72 } = res.data.user;
      const { name: teamName } = res.data.team;

      if (this.userData) {
        this.userData.userName = name;
        this.userData.userAvatar = image_72;
        this.userData.teamName = teamName;

        return this.userData;
      }
    }

    throw new Error('Unable to fetch user data');
  }

  async fetchTeamData(teamId: string): Promise<any> {
    const query = qs.stringify({
      user: teamId
    });

    const res = await axios.get(`https://slack.com/api/team.info?${query}`, {
      headers: { Authorization: `Bearer ${this.slackAccessToken}` }
    });

    if (res.data.ok === true) {
      const { name } = res.data.team;

      if (this.userData) {
        this.userData.teamName = name;

        return this.userData;
      }
    }

    throw new Error('Unable to fetch team data');
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

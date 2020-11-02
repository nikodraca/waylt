import axios from 'axios';
import { is } from 'electron-util';
import { SlackUserData } from '../types';

const axiosRetry = require('axios-retry');

/**
 * In order to not store client secret on the Electron app,
 * we call an external auth API which will exchange the code for an access token
 */
export class AuthService {
  async getAuthData(code: string): Promise<SlackUserData & { accessToken: string }> {
    axiosRetry(axios, { retries: 3 });

    const baseUrl = is.development
      ? process.env.AUTH_ENDPOINT
      : 'https://songstatus-auth-api.herokuapp.com';
    const authEndpoint = `${baseUrl}/auth`;

    const response = await axios.post(authEndpoint as string, {
      code
    });
    return response.data;
  }
}

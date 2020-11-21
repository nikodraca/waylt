import { PlayerPreferences, SlackUserData, SpotifyTrack } from '../types';

import { SpotifyService } from '../services/SpotifyService';
import { SlackService } from '../services/SlackService';

import ElectronStore = require('electron-store');

export class PlayerController {
  private spotifyService: SpotifyService;
  private slackService: SlackService;
  private store: ElectronStore;
  private isUpdating: boolean; // acts as a lock to prevent the AppleScript from running too often

  constructor(spotifyService: SpotifyService, slackService: SlackService, store: ElectronStore) {
    this.spotifyService = spotifyService;
    this.slackService = slackService;
    this.store = store;
    this.isUpdating = false;
  }

  hydrateAccessToken() {
    if (this.store.has('slackAccessToken')) {
      this.slackService.setAccessToken(this.store.get('slackAccessToken') as string);
    }
  }

  async updateIfNewTrack(): Promise<boolean> {
    if (this.isIncognito()) {
      return false;
    }

    this.isUpdating = true;
    let wasUpdated = false;
    const currentTrack = await this.spotifyService.getCurrentlyPlaying();

    if (
      currentTrack &&
      this.spotifyService.isNewTrackPlaying(currentTrack) &&
      this.isUserAuthenticated()
    ) {
      this.spotifyService.setLastTrack(currentTrack);

      const formattedTrackAndArtist = this.spotifyService.getFormattedTrack();
      await this.slackService.postMessage(formattedTrackAndArtist);

      wasUpdated = true;
    }

    this.isUpdating = false;
    return wasUpdated;
  }

  isPlayerUpdating(): boolean {
    return this.isUpdating;
  }

  isUserAuthenticated(): boolean {
    return !!this.store.get('slackAccessToken') as boolean;
  }

  async exchangeUserCodeForAccessToken(code: string): Promise<SlackUserData> {
    const { slackAccessToken, userData } = await this.slackService.exchangeCodeForAccessToken(code);

    this.store.set('slackAccessToken', slackAccessToken);
    this.store.set('slackUserData', userData);

    return userData;
  }

  async fetchUserData(userId: string) {
    const userData = await this.slackService.fetchUserData(userId);

    this.store.set('slackUserData', userData);
    return userData;
  }

  getCurrentlyPlayingTrack(): SpotifyTrack | undefined {
    return this.spotifyService.getLastTrack();
  }

  private isIncognito(): boolean {
    if (!this.store.has('isIncognito')) {
      this.store.set('isIncognito', false);
    }

    return !!this.store.get('isIncognito');
  }

  getUserData(): SlackUserData | undefined {
    if (this.store.has('slackUserData')) {
      return this.store.get('slackUserData') as SlackUserData;
    }
  }

  getPlayerPreferences(): PlayerPreferences {
    return {
      isIncognito: this.isIncognito()
    };
  }

  setPlayerPreference(key: keyof PlayerPreferences, value: any) {
    this.store.set(key, value);
  }

  logOut(): boolean {
    try {
      this.store.clear();
    } catch (err) {
      return false;
    }

    return true;
  }
}

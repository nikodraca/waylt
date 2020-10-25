import { SpotifyService } from '../services/SpotifyService';
import { SlackService } from '../services/SlackService';
import ElectronStore = require('electron-store');
import { PlayerPreferences } from '../types';

export class PlayerController {
  private spotifyService: SpotifyService;
  private slackService: SlackService;
  private store: ElectronStore;

  constructor(spotifyService: SpotifyService, slackService: SlackService, store: ElectronStore) {
    this.spotifyService = spotifyService;
    this.slackService = slackService;
    this.store = store;
  }

  async updateIfNewTrack(): Promise<boolean> {
    if (this.isIncognito()) {
      return false;
    }

    let wasUpdated = false;
    const currentTrack = await this.spotifyService.getTrackAndArtist();

    if (
      this.spotifyService.isNewTrackPlaying(currentTrack) &&
      this.slackService.isAuthenticated()
    ) {
      await this.slackService.postMessage(currentTrack);
      this.spotifyService.setLastTrack(currentTrack);

      wasUpdated = true;
    }

    return wasUpdated;
  }

  isUserAuthenticated(): boolean {
    return this.slackService.isAuthenticated();
  }

  async exchangeUserCodeForAccessToken(code: string): Promise<void> {
    await this.slackService.exchangeCodeForAccessToken(code);
  }

  getCurrentlyPlayingTrack(): string {
    return this.spotifyService.getLastTrack();
  }

  private isIncognito(): boolean {
    if (!this.store.has('isIncognito')) {
      this.store.set('isIncognito', false);
    }

    return !!this.store.get('isIncognito');
  }

  getPlayerPreferences(): PlayerPreferences {
    return {
      isIncognito: this.isIncognito()
    };
  }

  setPlayerPreference(key: keyof PlayerPreferences, value: any) {
    this.store.set(key, value);
  }
}

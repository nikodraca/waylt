import { SpotifyService } from '../services/SpotifyService';
import { SlackService } from '../services/SlackService';

export class PlayerController {
  private spotifyService: SpotifyService;
  private slackService: SlackService;

  constructor(spotifyService: SpotifyService, slackService: SlackService) {
    this.spotifyService = spotifyService;
    this.slackService = slackService;
  }

  async updateIfNewTrack(): Promise<boolean> {
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
}

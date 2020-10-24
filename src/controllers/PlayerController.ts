import { SpotifyService } from '../services/SpotifyService';
import { SlackService } from '../services/SlackService';

export class PlayerController {
  spotifyService: SpotifyService;
  slackService: SlackService;

  constructor(spotifyService: SpotifyService, slackService: SlackService) {
    this.spotifyService = spotifyService;
    this.slackService = slackService;
  }

  startListening() {
    setInterval(async () => {
      const currentTrack = await this.spotifyService.getTrackAndArtist();

      if (
        this.spotifyService.isNewTrackPlaying(currentTrack) &&
        this.slackService.isAuthenticated()
      ) {
        await this.slackService.postMessage(currentTrack);
        this.spotifyService.setLastTrack(currentTrack);
      }
    }, 3000);
  }
}

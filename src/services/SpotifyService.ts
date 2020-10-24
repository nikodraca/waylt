import * as runApplescript from 'run-applescript';

export class SpotifyService {
  private lastTrack: string;
  constructor() {}

  private async getArtistName() {
    return await runApplescript('tell application "Spotify" to artist of current track as string');
  }

  private async getTrackName() {
    return await runApplescript('tell application "Spotify" to name of current track as string');
  }

  async getTrackAndArtist() {
    const title = await this.getTrackName();
    const artist = await this.getArtistName();

    return `${title} - ${artist}`;
  }

  isNewTrackPlaying(currentTrack: string): boolean {
    return currentTrack !== this.lastTrack;
  }

  setLastTrack(track: string) {
    this.lastTrack = track;
  }
}

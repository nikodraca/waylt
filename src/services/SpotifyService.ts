import * as runApplescript from 'run-applescript';
import { SpotifyTrack } from '../types';

export class SpotifyService {
  private lastTrack: SpotifyTrack;
  constructor() {}

  private async getArtistName() {
    return await runApplescript('tell application "Spotify" to artist of current track as string');
  }

  private async getTrackName() {
    return await runApplescript('tell application "Spotify" to name of current track as string');
  }

  async getTrackAndArtist(): Promise<SpotifyTrack> {
    const [title, artist] = await Promise.all([
      await this.getTrackName(),
      await this.getArtistName()
    ]);

    return {
      title,
      artist
    };
  }

  getFormattedTrack(): string {
    const { title, artist } = this.lastTrack;
    return `${title} - ${artist}`;
  }

  isNewTrackPlaying({ title, artist }: SpotifyTrack): boolean {
    if (!this.lastTrack) {
      return true;
    }

    return title !== this.lastTrack.title || artist !== this.lastTrack.artist;
  }

  setLastTrack(track: SpotifyTrack) {
    this.lastTrack = track;
  }

  getLastTrack() {
    return this.lastTrack;
  }
}

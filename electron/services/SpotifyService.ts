import * as runApplescript from 'run-applescript';
import { SpotifyTrack } from '../types';

export class SpotifyService {
  private lastTrack: SpotifyTrack | undefined;

  constructor() {
    this.lastTrack = undefined;
  }

  private async getArtistName() {
    return await runApplescript('tell application "Spotify" to artist of current track as string');
  }

  private async getTrackName() {
    return await runApplescript('tell application "Spotify" to name of current track as string');
  }

  async getTrackAndArtist(): Promise<SpotifyTrack | undefined> {
    try {
      const [title, artist] = await Promise.all([
        await this.getTrackName(),
        await this.getArtistName()
      ]);

      return {
        title,
        artist
      };
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  getFormattedTrack(): string {
    if (!this.lastTrack) {
      throw new Error('Could not fetch track');
    }

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

import * as runApplescript from 'run-applescript';
import { SpotifyTrack } from '../types';

export class SpotifyService {
  private lastTrack: SpotifyTrack | undefined;

  constructor() {
    this.lastTrack = undefined;
  }

  private async getTrackID() {
    return await runApplescript('tell application "Spotify" to id of current track as string');
  }

  private async getArtistName() {
    return await runApplescript('tell application "Spotify" to artist of current track as string');
  }

  private async getTrackName() {
    return await runApplescript('tell application "Spotify" to name of current track as string');
  }

  async getCurrentlyPlaying(): Promise<SpotifyTrack | undefined> {
    try {
      const [title, artist, id] = await Promise.all([
        this.getTrackName(),
        this.getArtistName(),
        this.getTrackID()
      ]);

      return {
        title,
        artist,
        id
      };
    } catch (err) {
      console.log({ err });
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

  isNewTrackPlaying(id: string): boolean {
    if (!this.lastTrack) {
      return true;
    }

    return id !== this.lastTrack.id;
  }

  setLastTrack(track: SpotifyTrack) {
    this.lastTrack = track;
  }

  getLastTrack() {
    return this.lastTrack;
  }
}

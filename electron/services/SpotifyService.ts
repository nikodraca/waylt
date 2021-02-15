import * as runApplescript from 'run-applescript';
import { SpotifyTrack } from '../types';
import log from 'electron-log';

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

      log.info(
        JSON.stringify({
          title,
          artist,
          id
        })
      );

      return {
        title,
        artist,
        id
      };
    } catch (err) {
      log.warn({ err });
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

  isNewTrackPlaying({ id, title, artist }: SpotifyTrack): boolean {
    if (!this.lastTrack) {
      return true;
    }

    return (
      id !== this.lastTrack.id || title !== this.lastTrack.title || artist !== this.lastTrack.artist
    );
  }

  setLastTrack(track: SpotifyTrack) {
    this.lastTrack = track;
  }

  getLastTrack() {
    return this.lastTrack;
  }
}

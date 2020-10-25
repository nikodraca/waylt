import React from 'react';
import { PlayerPreferences } from '../../../types';

interface PlayerContainerProps {
  currentlyPlayingTrack: string;
  playerPreferences: PlayerPreferences;
}

export const PlayerContainer = ({
  currentlyPlayingTrack,
  playerPreferences
}: PlayerContainerProps): JSX.Element => {
  return (
    <div>
      <h2>Listening to: {currentlyPlayingTrack}</h2>
      <h3>Broadcasting: {playerPreferences.isIncognito ? 'YES' : 'NO'}</h3>
    </div>
  );
};

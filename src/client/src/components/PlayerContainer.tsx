import React from 'react';
import { PlayerPreferences } from '../../../types';

interface PlayerContainerProps {
  currentlyPlayingTrack: string;
  playerPreferences: PlayerPreferences;
  ipcRenderer: any;
}

export const PlayerContainer = ({
  currentlyPlayingTrack,
  playerPreferences,
  ipcRenderer
}: PlayerContainerProps): JSX.Element => {
  const handleClick = () => {
    ipcRenderer.send('message-to-main', { type: 'TOGGLE_INCOGNITO' });
  };

  return (
    <div>
      <h2>Listening to: {currentlyPlayingTrack}</h2>
      <h3>Broadcasting: {playerPreferences.isIncognito ? 'NO' : 'YES'}</h3>

      <button onClick={handleClick}>Start Broadcasting</button>
    </div>
  );
};

import React from 'react';
import { PlayerPreferences, SlackUserData } from '../../../types';

interface PlayerContainerProps {
  currentlyPlayingTrack: string;
  playerPreferences: PlayerPreferences;
  userData: SlackUserData;
  ipcRenderer: any;
}

export const PlayerContainer = ({
  currentlyPlayingTrack,
  playerPreferences,
  userData,
  ipcRenderer
}: PlayerContainerProps): JSX.Element => {
  const handleClick = () => {
    ipcRenderer.send('message-to-main', { type: 'TOGGLE_INCOGNITO' });
  };

  return (
    <div>
      <img src={userData.userAvatar} alt={userData.userId} />
      <p>
        {userData.userName} @ {userData.teamName}
      </p>

      <h2>Listening to: {currentlyPlayingTrack}</h2>
      <h3>Broadcasting: {playerPreferences.isIncognito ? 'NO' : 'YES'}</h3>

      <button onClick={handleClick}>Start Broadcasting</button>
    </div>
  );
};

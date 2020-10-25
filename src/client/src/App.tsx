import React, { useEffect, useState } from 'react';
import isElectron from 'is-electron';
import { Message, PlayerPreferences } from '../../types';
import { AuthContainer, PlayerContainer } from './components';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer = electron.ipcRenderer;

function App() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState<string>('');
  const [playerPreferences, setPlayerPreferences] = useState<PlayerPreferences>({
    isIncognito: false
  });

  const { REACT_APP_SLACK_CLIENT_ID, REACT_APP_SLACK_REDIRECT_URI } = process.env;
  const slackAuthUrl = `https://slack.com/oauth/authorize?client_id=${REACT_APP_SLACK_CLIENT_ID}&scope=users.profile:write&redirect_uri=${REACT_APP_SLACK_REDIRECT_URI}`;

  useEffect(() => {
    if (isElectron()) {
      ipcRenderer.send('message-to-main', { type: 'AUTH' });
      ipcRenderer.send('message-to-main', { type: 'CURRENTLY_PLAYING' });
      ipcRenderer.send('message-to-main', { type: 'PLAYER_PREFERENCES' });

      ipcRenderer.on('message-from-main', (e: any, { type, body }: Message) => {
        if (type === 'AUTH') {
          setIsUserAuthenticated(body);
        } else if (type === 'CURRENTLY_PLAYING') {
          setCurrentlyPlayingTrack(body);
        } else if (type === 'PLAYER_PREFERENCES') {
          setPlayerPreferences(body);
        }
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">Slackify</header>
      {isUserAuthenticated ? (
        <PlayerContainer
          currentlyPlayingTrack={currentlyPlayingTrack}
          playerPreferences={playerPreferences}
        />
      ) : (
        <AuthContainer slackAuthUrl={slackAuthUrl} />
      )}
    </div>
  );
}

export default App;

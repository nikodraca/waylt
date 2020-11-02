import React, { useEffect, useState } from 'react';
import isElectron from 'is-electron';
import { Message, PlayerPreferences, SlackUserData, SpotifyTrack } from '../electron/types';
import { AuthContainer, PlayerContainer } from './components';
import { REACT_APP_SLACK_CLIENT_ID, REACT_APP_SLACK_REDIRECT_URI } from './constants';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer = electron.ipcRenderer;

function App() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState<SpotifyTrack>({
    title: '',
    artist: '',
    id: ''
  });
  const [playerPreferences, setPlayerPreferences] = useState<PlayerPreferences>({
    isIncognito: false
  });
  const [userData, setUserData] = useState<SlackUserData>({
    userId: '',
    teamId: '',
    teamName: '',
    userName: '',
    userAvatar: ''
  });

  const scopes = ['users.profile:write', 'users:read'].join(' ');
  const slackAuthUrl = `https://slack.com/oauth/authorize?client_id=${REACT_APP_SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${REACT_APP_SLACK_REDIRECT_URI}`;

  useEffect(() => {
    if (isElectron()) {
      ipcRenderer.send('message-to-main', { type: 'AUTH' });
      ipcRenderer.send('message-to-main', { type: 'CURRENTLY_PLAYING' });
      ipcRenderer.send('message-to-main', { type: 'PLAYER_PREFERENCES' });
      ipcRenderer.send('message-to-main', { type: 'USER_DATA' });

      ipcRenderer.on('message-from-main', (e: any, { type, body }: Message) => {
        if (type === 'AUTH') {
          setIsUserAuthenticated(body);
        } else if (type === 'CURRENTLY_PLAYING') {
          setCurrentlyPlayingTrack(body);
        } else if (type === 'PLAYER_PREFERENCES') {
          setPlayerPreferences(body);
        } else if (type === 'USER_DATA') {
          setUserData(body);
        }
      });
    }
  }, []);

  return (
    <div className="App" style={{ backgroundColor: '#070518' }}>
      {isUserAuthenticated ? (
        <PlayerContainer
          currentlyPlayingTrack={currentlyPlayingTrack}
          playerPreferences={playerPreferences}
          userData={userData}
          ipcRenderer={ipcRenderer}
        />
      ) : (
        <AuthContainer slackAuthUrl={slackAuthUrl} />
      )}
    </div>
  );
}

export default App;

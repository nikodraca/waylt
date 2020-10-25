import React, { useEffect, useState } from 'react';
import isElectron from 'is-electron';
import { Message } from '../../types';
import { AuthContainer } from './components';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer = electron.ipcRenderer;

function App() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState();

  const { REACT_APP_SLACK_CLIENT_ID, REACT_APP_SLACK_REDIRECT_URI } = process.env;
  const slackAuthUrl = `https://slack.com/oauth/authorize?client_id=${REACT_APP_SLACK_CLIENT_ID}&scope=users.profile:write&redirect_uri=${REACT_APP_SLACK_REDIRECT_URI}`;

  useEffect(() => {
    if (isElectron()) {
      ipcRenderer.send('message-to-main', { type: 'AUTH' });
      ipcRenderer.send('message-to-main', { type: 'CURRENTLY_PLAYING' });

      ipcRenderer.on('message-from-main', (e: any, { type, body }: Message) => {
        if (type === 'AUTH') {
          setIsUserAuthenticated(body);
        }
        if (type === 'CURRENTLY_PLAYING') {
          console.log(body);
          setCurrentlyPlayingTrack(body);
        }
      });
    }
  });

  return (
    <div className="App">
      <header className="App-header">Slackify</header>
      {isUserAuthenticated ? (
        <div>Currently Playing: {currentlyPlayingTrack || ''}</div>
      ) : (
        <AuthContainer slackAuthUrl={slackAuthUrl} />
      )}
    </div>
  );
}

export default App;

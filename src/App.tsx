import React, { useEffect, useState } from 'react';
import isElectron from 'is-electron';

import { Message, PlayerPreferences, SlackUserData, SpotifyTrack } from '../electron/types';
import { AuthContainer, PlayerContainer, SettingsContainer } from './pages';
import { Header } from './components';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer = electron.ipcRenderer;

function App() {
  const defaultCurrentlyPlayingTrack: SpotifyTrack = {
    title: '',
    artist: '',
    id: ''
  };

  const defaultUserData: SlackUserData = {
    userId: '',
    teamId: '',
    teamName: '',
    userName: '',
    userAvatar: ''
  };

  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState<SpotifyTrack>(
    defaultCurrentlyPlayingTrack
  );
  const [playerPreferences, setPlayerPreferences] = useState<PlayerPreferences>({
    isIncognito: false
  });
  const [userData, setUserData] = useState<SlackUserData>(defaultUserData);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useEffect(() => {
    if (isElectron()) {
      ipcRenderer.on('message-from-main', (e: any, { type, body }: Message) => {
        if (type === 'AUTH') {
          setIsUserAuthenticated(body);
        } else if (type === 'CURRENTLY_PLAYING') {
          setCurrentlyPlayingTrack(body);
        } else if (type === 'PLAYER_PREFERENCES') {
          setPlayerPreferences(body);
        } else if (type === 'USER_DATA') {
          setUserData(body);
        } else if (type === 'LOGOUT') {
          // logout success
          if (body) {
            setIsUserAuthenticated(false);
            setUserData(defaultUserData);
            setCurrentlyPlayingTrack(defaultCurrentlyPlayingTrack);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isElectron()) {
      ipcRenderer.send('message-to-main', { type: 'AUTH' });
      ipcRenderer.send('message-to-main', { type: 'CURRENTLY_PLAYING' });
      ipcRenderer.send('message-to-main', { type: 'PLAYER_PREFERENCES' });
      ipcRenderer.send('message-to-main', { type: 'USER_DATA' });
    }
  }, [isUserAuthenticated]);

  const toggleSettingsHandler = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  /**
   * I figured we could do without a proper router since the UI is so simple
   * Instead I use state to toggle what pages are in view
   */
  return (
    <div className="App">
      <Header
        isUserAuthenticated={isUserAuthenticated}
        toggleSettingsHandler={toggleSettingsHandler}
      />
      {isUserAuthenticated ? (
        <PlayerContainer
          currentlyPlayingTrack={currentlyPlayingTrack}
          playerPreferences={playerPreferences}
          userData={userData}
          ipcRenderer={ipcRenderer}
        />
      ) : (
        <AuthContainer />
      )}

      {isSettingsVisible && isUserAuthenticated && <SettingsContainer ipcRenderer={ipcRenderer} />}
    </div>
  );
}

export default App;

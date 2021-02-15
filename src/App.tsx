import React, { useEffect, useState } from 'react';
import isElectron from 'is-electron';

import { Message, PlayerPreferences, SlackUserData, SpotifyTrack } from '../electron/types';
import { AuthContainer, PlayerContainer, SettingsContainer } from './pages';
import { Header, Banner } from './components';

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
  const [appVersion, setAppVersion] = useState<string>();
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  useEffect(() => {
    if (isElectron()) {
      ipcRenderer.on('message-from-main', (e: any, { type, body }: Message) => {
        switch (type) {
          case 'AUTH':
            setIsUserAuthenticated(body);
            break;

          case 'CURRENTLY_PLAYING':
            setCurrentlyPlayingTrack(body);
            break;

          case 'PLAYER_PREFERENCES':
            setPlayerPreferences(body);
            break;

          case 'USER_DATA':
            setUserData(body);
            break;

          case 'LOGOUT':
            // logout success
            if (body) {
              setIsUserAuthenticated(false);
              setUserData(defaultUserData);
              setCurrentlyPlayingTrack(defaultCurrentlyPlayingTrack);
            }
            break;

          case 'APP_VERSION':
            setAppVersion(body);
            break;

          case 'UPDATE_AVAILABLE':
            setIsUpdateAvailable(true);
            break;

          case 'UPDATE_DOWNLOADED':
            setIsUpdateDownloaded(true);
            break;

          case 'CHECKING_UPDATE':
            setIsCheckingUpdate(true);
            break;

          default:
            break;
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
      ipcRenderer.send('message-to-main', { type: 'APP_VERSION' });
    }
  }, [isUserAuthenticated]);

  const toggleSettingsHandler = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  const updateAndRestart = () => {
    if (isElectron()) {
      ipcRenderer.send('message-to-main', { type: 'RESTART_APP' });
    }
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
      {isUpdateAvailable && isUpdateDownloaded && (
        <Banner onClick={updateAndRestart} text="New update available" actionText="Restart" />
      )}
    </div>
  );
}

export default App;

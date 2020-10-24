require('dotenv').config();

import { app, BrowserWindow, Tray } from 'electron';
import * as path from 'path';
import { is } from 'electron-util';
import * as qs from 'query-string';

import { SpotifyService } from './services/SpotifyService';
import { SlackService } from './services/SlackService';

let mainWindow: BrowserWindow;
let tray: Tray;
let spotifyService: SpotifyService;
let slackService: SlackService;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
    width: 500,
    height: 500,
    webPreferences: {
      devTools: is.development,
      nodeIntegration: true,
      backgroundThrottling: false
    },
    frame: false,
    fullscreenable: false,
    resizable: false,
    show: false
  });

  if (is.development) {
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../dist/client/index.html')}`);
  }

  mainWindow.webContents.on('will-redirect', function (event: any, oldUrl: any, newUrl: any) {
    const parsedQueryString = qs.parseUrl(oldUrl);
    const { code } = parsedQueryString.query;

    if (code && Object.keys(parsedQueryString.query).includes('state')) {
      slackService.exchangeCodeForAccessToken(code as string);
    }
  });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, '../static/img/icon.png'));
  tray.setIgnoreDoubleClickEvents(true);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      const windowBounds = mainWindow.getBounds();
      const trayBounds = tray.getBounds();
      const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
      const y = Math.round(trayBounds.y + trayBounds.height);

      mainWindow.setPosition(x, y, false);
      mainWindow.show();
      mainWindow.setVisibleOnAllWorkspaces(true);
      mainWindow.focus();
      mainWindow.setVisibleOnAllWorkspaces(false);
    }

    app.dock.hide();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createMainWindow();
  createTray();

  spotifyService = new SpotifyService();
  slackService = new SlackService();

  setInterval(async () => {
    const currentTrack = await spotifyService.getTrackAndArtist();

    if (spotifyService.isNewTrackPlaying(currentTrack)) {
      await slackService.postMessage(currentTrack);
    }
  }, 1000);

  app.dock.hide();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

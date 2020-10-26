require('dotenv').config();

import { app, BrowserWindow, Tray } from 'electron';
import ElectronStore = require('electron-store');

import { SpotifyService } from './services/SpotifyService';
import { SlackService } from './services/SlackService';
import { MainWindowGenerator } from './generators/MainWindowGenerator';
import { TrayGenerator } from './generators/TrayGenerator';
import { PlayerController } from './controllers/PlayerController';

let mainWindow: BrowserWindow;
let tray: Tray;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const store = new ElectronStore();

  const spotifyService = new SpotifyService();
  const slackService = new SlackService();

  const playerController = new PlayerController(spotifyService, slackService, store);
  playerController.hydrateAccessToken();

  const mainWindowGenerator = new MainWindowGenerator(playerController);
  mainWindow = mainWindowGenerator.createMainWindow();

  const trayGenerator = new TrayGenerator(mainWindow);
  tray = trayGenerator.createTray();

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

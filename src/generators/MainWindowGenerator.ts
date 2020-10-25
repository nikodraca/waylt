import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { is } from 'electron-util';
import * as qs from 'query-string';
import { PlayerController } from '../controllers/PlayerController';
import { Message } from '../types';

export class MainWindowGenerator {
  playerController: PlayerController;

  constructor(playerController: PlayerController) {
    this.playerController = playerController;
  }

  /**
   * Set up the BrowserWindow and apply all event listeners/handlers
   * The playerController should handle all business logic here
   */
  createMainWindow = (): BrowserWindow => {
    const mainWindow = new BrowserWindow({
      backgroundColor: '#fff',
      width: 500,
      height: 500,
      webPreferences: {
        devTools: is.development,
        nodeIntegration: true,
        backgroundThrottling: true,
        worldSafeExecuteJavaScript: true,
        preload: path.join(__dirname, '../preload.js')
      },
      frame: false,
      fullscreenable: false,
      resizable: false,
      show: is.development
    });

    if (is.development) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
      mainWindow.loadURL('http://localhost:3000');
    } else {
      mainWindow.loadURL(`file://${path.join(__dirname, '../dist/client/index.html')}`);
    }

    mainWindow.webContents.on(
      'will-redirect',
      (event: Electron.IpcMainEvent, oldUrl: any, newUrl: any) => {
        const isAuthorized = this.handleAuthRedirect(oldUrl);
        if (isAuthorized) {
          this.sendMessage(mainWindow, {
            type: 'AUTH',
            body: isAuthorized
          });
        }
      }
    );

    ipcMain.on('message-to-main', (event: Electron.IpcMainEvent, { type }: Message) => {
      if (type === 'AUTH') {
        this.sendMessage(mainWindow, {
          type: 'AUTH',
          body: this.playerController.isUserAuthenticated()
        });
      } else if (type === 'CURRENTLY_PLAYING') {
        this.sendMessage(mainWindow, {
          type: 'CURRENTLY_PLAYING',
          body: this.playerController.getCurrentlyPlayingTrack()
        });
      } else if (type === 'PLAYER_PREFERENCES') {
        this.sendMessage(mainWindow, {
          type: 'PLAYER_PREFERENCES',
          body: this.playerController.getPlayerPreferences()
        });
      } else if (type === 'TOGGLE_INCOGNITO') {
        const playerPreferences = this.playerController.getPlayerPreferences();
        this.playerController.setPlayerPreference('isIncognito', !playerPreferences.isIncognito);

        this.sendMessage(mainWindow, {
          type: 'PLAYER_PREFERENCES',
          body: this.playerController.getPlayerPreferences()
        });
      }
    });

    setInterval(async () => {
      const wasUpdated = await this.playerController.updateIfNewTrack();

      if (wasUpdated) {
        this.sendMessage(mainWindow, {
          type: 'CURRENTLY_PLAYING',
          body: this.playerController.getCurrentlyPlayingTrack()
        });
      }
    }, 3000);

    return mainWindow;
  };

  private handleAuthRedirect(url: string): boolean {
    let isAuthorized = false;
    const parsedQueryString = qs.parseUrl(url);
    const { code } = parsedQueryString.query;

    if (code && Object.keys(parsedQueryString.query).includes('state')) {
      this.playerController.exchangeUserCodeForAccessToken(code as string);
      isAuthorized = true;
    }

    return isAuthorized;
  }

  private sendMessage(mainWindow: BrowserWindow, message: Message) {
    mainWindow.webContents.send('message-from-main', message);
  }
}

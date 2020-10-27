import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { is } from 'electron-util';
import * as qs from 'query-string';
import { PlayerController } from '../controllers/PlayerController';
import { Message, MessageType } from '../types';

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

    // if (is.development) {
    //   mainWindow.webContents.openDevTools({ mode: 'detach' });
    //   mainWindow.loadURL('http://localhost:3000');
    // } else {
    console.log(`file://${path.join(__dirname, '../client/index.html')}`);
    mainWindow.loadURL(`file://${path.join(__dirname, '../client/index.html')}`);
    // }

    mainWindow.webContents.on(
      'will-redirect',
      async (event: Electron.IpcMainEvent, oldUrl: any, newUrl: any) => {
        const isAuthorized = await this.handleAuthRedirect(oldUrl);
        if (isAuthorized) {
          this.sendMessage(mainWindow, {
            type: 'AUTH',
            body: this.playerController.isUserAuthenticated()
          });

          this.sendMessage(mainWindow, {
            type: 'USER_DATA',
            body: this.playerController.getUserData()
          });
        }
      }
    );

    ipcMain.on('message-to-main', (event: Electron.IpcMainEvent, { type }: Message) => {
      this.generateIpcMessageHandlers(mainWindow, type);
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

  private async handleAuthRedirect(url: string): Promise<boolean> {
    let isAuthorized = false;
    const parsedQueryString = qs.parseUrl(url);
    const { code } = parsedQueryString.query;

    if (code && Object.keys(parsedQueryString.query).includes('state')) {
      const { userId } = await this.playerController.exchangeUserCodeForAccessToken(code as string);
      await this.playerController.fetchUserData(userId);
      isAuthorized = true;
    }

    return isAuthorized;
  }

  private sendMessage(mainWindow: BrowserWindow, message: Message) {
    mainWindow.webContents.send('message-from-main', message);
  }

  private generateIpcMessageHandlers(mainWindow: BrowserWindow, type: MessageType) {
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
    } else if (type === 'USER_DATA') {
      const userData = this.playerController.getUserData();

      if (userData) {
        this.sendMessage(mainWindow, {
          type: 'USER_DATA',
          body: userData
        });
      }
    }
  }
}

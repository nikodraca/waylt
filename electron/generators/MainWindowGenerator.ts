import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { is } from 'electron-util';
import * as qs from 'query-string';
import { createServer } from 'https';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import { PlayerController } from '../controllers/PlayerController';
import { Message, MessageType } from '../types';
import { version } from '../../package.json';

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
      backgroundColor: 'transparent',
      width: 500,
      height: 300,
      webPreferences: {
        devTools: is.development,
        nodeIntegration: true,
        backgroundThrottling: false,
        worldSafeExecuteJavaScript: true,
        preload: path.join(__dirname, '../preload.js')
      },
      frame: false,
      fullscreenable: false,
      resizable: false,
      show: is.development
    });

    mainWindow.on('show', () => {
      log.info('show');
      autoUpdater.checkForUpdatesAndNotify();
    });

    autoUpdater.on('checking-for-update', () => {
      log.info('checking-for-update');
      this.sendMessage(mainWindow, {
        type: 'CHECKING_UPDATE'
      });
    });

    autoUpdater.on('update-available', () => {
      log.info('update-available');
      this.sendMessage(mainWindow, {
        type: 'UPDATE_AVAILABLE'
      });
    });

    autoUpdater.on('update-downloaded', () => {
      log.info('update-downloaded');
      this.sendMessage(mainWindow, {
        type: 'UPDATE_DOWNLOADED'
      });
    });

    autoUpdater.on('error', (err) => {
      log.info('err', err);
    });

    const key = fs.readFileSync(path.join(__dirname, '../../key.pem')).toString();
    const cert = fs.readFileSync(path.join(__dirname, '../../cert.pem')).toString();

    /**
     * Create auth web server to intercept OAuth code
     * Once completed, exchange for access token and close server
     */
    const authServer = createServer({ key, cert }, async (req, res) => {
      const isAuthorized = await this.handleAuthRedirect(req.url as string);

      if (isAuthorized) {
        this.sendMessage(mainWindow, {
          type: 'AUTH',
          body: this.playerController.isUserAuthenticated()
        });

        this.sendMessage(mainWindow, {
          type: 'USER_DATA',
          body: this.playerController.getUserData()
        });

        this.loadApp(mainWindow);
      }
    });

    authServer.listen(7734);

    this.loadApp(mainWindow);

    // Hot Reloading
    if (is.development) {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit'
      });
    }

    ipcMain.on('message-to-main', (event: Electron.IpcMainEvent, { type }: Message) => {
      this.generateIpcMessageHandlers(mainWindow, type);
    });

    setInterval(async () => {
      if (
        this.playerController.isUserAuthenticated() &&
        !this.playerController.isPlayerUpdating()
      ) {
        const wasUpdated = await this.playerController.updateIfNewTrack();

        if (wasUpdated) {
          this.sendMessage(mainWindow, {
            type: 'CURRENTLY_PLAYING',
            body: this.playerController.getCurrentlyPlayingTrack()
          });
        }
      }
    }, 3000);

    return mainWindow;
  };

  private loadApp(mainWindow: BrowserWindow) {
    if (is.development) {
      mainWindow.loadURL('http://localhost:3000/index.html');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      // 'build/index.html'
      mainWindow.loadURL(`file://${__dirname}/../../index.html`);
    }
  }

  private async handleAuthRedirect(url: string): Promise<boolean> {
    let isAuthorized = false;
    const parsedQueryString = qs.parseUrl(url);
    const { code } = parsedQueryString.query;

    if (code && Object.keys(parsedQueryString.query).includes('state')) {
      await this.playerController.exchangeUserCodeForAccessToken(code as string);
      await this.playerController.fetchUserData();

      isAuthorized = true;
    }

    return isAuthorized;
  }

  private sendMessage(mainWindow: BrowserWindow, message: Message) {
    mainWindow.webContents.send('message-from-main', message);
  }

  private async generateIpcMessageHandlers(mainWindow: BrowserWindow, type: MessageType) {
    switch (type) {
      case 'AUTH':
        this.sendMessage(mainWindow, {
          type: 'AUTH',
          body: this.playerController.isUserAuthenticated()
        });
        break;

      case 'LOGOUT':
        this.sendMessage(mainWindow, {
          type: 'LOGOUT',
          body: this.playerController.logOut()
        });
        break;

      case 'CURRENTLY_PLAYING':
        this.sendMessage(mainWindow, {
          type: 'CURRENTLY_PLAYING',
          body: this.playerController.getCurrentlyPlayingTrack()
        });
        break;

      case 'PLAYER_PREFERENCES':
        this.sendMessage(mainWindow, {
          type: 'PLAYER_PREFERENCES',
          body: this.playerController.getPlayerPreferences()
        });
        break;

      case 'TOGGLE_INCOGNITO':
        const playerPreferences = this.playerController.getPlayerPreferences();
        this.playerController.setPlayerPreference('isIncognito', !playerPreferences.isIncognito);

        if (this.playerController.getPlayerPreferences().isIncognito) {
          await this.playerController.unsetStatus();
        }

        this.sendMessage(mainWindow, {
          type: 'PLAYER_PREFERENCES',
          body: this.playerController.getPlayerPreferences()
        });
        break;

      case 'USER_DATA':
        const userData = this.playerController.getUserData();

        if (userData) {
          this.sendMessage(mainWindow, {
            type: 'USER_DATA',
            body: userData
          });
        }
        break;
      case 'APP_VERSION':
        this.sendMessage(mainWindow, {
          type: 'APP_VERSION',
          body: version
        });
        break;

      case 'RESTART_APP':
        autoUpdater.quitAndInstall();
        break;

      default:
        break;
    }
  }
}

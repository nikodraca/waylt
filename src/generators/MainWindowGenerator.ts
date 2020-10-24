import { BrowserWindow } from 'electron';
import * as path from 'path';
import { is } from 'electron-util';
import * as qs from 'query-string';
import { SlackService } from '../services/SlackService';

export class MainWindowGenerator {
  slackService: SlackService;

  constructor(slackService: SlackService) {
    this.slackService = slackService;
  }

  createMainWindow = (): BrowserWindow => {
    const mainWindow = new BrowserWindow({
      backgroundColor: '#fff',
      width: 500,
      height: 500,
      webPreferences: {
        devTools: is.development,
        nodeIntegration: true,
        backgroundThrottling: true
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

    mainWindow.webContents.on('will-redirect', (event: any, oldUrl: any, newUrl: any) => {
      this.handleAuthRedirect(oldUrl);
    });

    return mainWindow;
  };

  private handleAuthRedirect(url: string) {
    const parsedQueryString = qs.parseUrl(url);
    const { code } = parsedQueryString.query;

    if (code && Object.keys(parsedQueryString.query).includes('state')) {
      this.slackService.exchangeCodeForAccessToken(code as string);
    }
  }
}

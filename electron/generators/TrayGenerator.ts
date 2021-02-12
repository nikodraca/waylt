import { app, BrowserWindow, Tray } from 'electron';
import * as path from 'path';

export class TrayGenerator {
  tray: Tray | undefined;
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.tray = undefined;
    this.mainWindow = mainWindow;
  }

  createTray = (): Tray => {
    const tray = new Tray(path.join(__dirname, '../static/img/iconTemplate.png'));
    tray.setIgnoreDoubleClickEvents(true);

    tray.on('click', () => this.handleClick(this.mainWindow));

    this.tray = tray;
    return tray;
  };

  private getPosition(): { x: number; y: number } {
    const windowBounds = this.mainWindow.getBounds();
    const trayBounds = this.tray!.getBounds();
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
    const y = Math.round(trayBounds.y + trayBounds.height);

    return { x, y };
  }

  private handleClick(mainWindow: BrowserWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      const { x, y } = this.getPosition();

      mainWindow.setPosition(x, y, false);
      mainWindow.show();
      mainWindow.setVisibleOnAllWorkspaces(true);
      mainWindow.focus();
      mainWindow.setVisibleOnAllWorkspaces(false);
    }

    // ensure dock stays hidden
    app.dock.hide();
  }
}

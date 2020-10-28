"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrayGenerator = void 0;
const electron_1 = require("electron");
const path = require("path");
class TrayGenerator {
    constructor(mainWindow) {
        this.createTray = () => {
            const tray = new electron_1.Tray(path.join(__dirname, '../static/img/icon.png'));
            tray.setIgnoreDoubleClickEvents(true);
            tray.on('click', () => this.handleClick(this.mainWindow));
            this.tray = tray;
            return tray;
        };
        this.tray = undefined;
        this.mainWindow = mainWindow;
    }
    getPosition() {
        const windowBounds = this.mainWindow.getBounds();
        const trayBounds = this.tray.getBounds();
        const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
        const y = Math.round(trayBounds.y + trayBounds.height);
        return { x, y };
    }
    handleClick(mainWindow) {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        }
        else {
            const { x, y } = this.getPosition();
            mainWindow.setPosition(x, y, false);
            mainWindow.show();
            mainWindow.setVisibleOnAllWorkspaces(true);
            mainWindow.focus();
            mainWindow.setVisibleOnAllWorkspaces(false);
        }
        // ensure dock stays hidden
        electron_1.app.dock.hide();
    }
}
exports.TrayGenerator = TrayGenerator;
//# sourceMappingURL=TrayGenerator.js.map
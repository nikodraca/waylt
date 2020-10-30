"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainWindowGenerator = void 0;
const electron_1 = require("electron");
const path = require("path");
const electron_util_1 = require("electron-util");
const qs = require("query-string");
class MainWindowGenerator {
    constructor(playerController) {
        /**
         * Set up the BrowserWindow and apply all event listeners/handlers
         * The playerController should handle all business logic here
         */
        this.createMainWindow = () => {
            const mainWindow = new electron_1.BrowserWindow({
                backgroundColor: 'transparent',
                width: 500,
                height: 300,
                webPreferences: {
                    devTools: electron_util_1.is.development,
                    nodeIntegration: true,
                    backgroundThrottling: true,
                    worldSafeExecuteJavaScript: true,
                    preload: path.join(__dirname, '../preload.js')
                },
                frame: false,
                fullscreenable: false,
                resizable: false,
                show: electron_util_1.is.development
            });
            if (electron_util_1.is.development) {
                mainWindow.loadURL('http://localhost:3000/index.html');
                mainWindow.webContents.openDevTools({ mode: 'detach' });
            }
            else {
                // 'build/index.html'
                mainWindow.loadURL(`file://${__dirname}/../../index.html`);
                mainWindow.webContents.openDevTools({ mode: 'detach' });
            }
            // Hot Reloading
            if (electron_util_1.is.development) {
                require('electron-reload')(__dirname, {
                    electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
                    forceHardReset: true,
                    hardResetMethod: 'exit'
                });
            }
            mainWindow.webContents.on('will-redirect', (event, oldUrl) => __awaiter(this, void 0, void 0, function* () {
                const isAuthorized = yield this.handleAuthRedirect(oldUrl);
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
            }));
            electron_1.ipcMain.on('message-to-main', (event, { type }) => {
                this.generateIpcMessageHandlers(mainWindow, type);
            });
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (this.playerController.isUserAuthenticated()) {
                    const wasUpdated = yield this.playerController.updateIfNewTrack();
                    if (wasUpdated) {
                        this.sendMessage(mainWindow, {
                            type: 'CURRENTLY_PLAYING',
                            body: this.playerController.getCurrentlyPlayingTrack()
                        });
                    }
                }
            }), 3000);
            return mainWindow;
        };
        this.playerController = playerController;
    }
    handleAuthRedirect(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let isAuthorized = false;
            const parsedQueryString = qs.parseUrl(url);
            const { code } = parsedQueryString.query;
            if (code && Object.keys(parsedQueryString.query).includes('state')) {
                const { userId } = yield this.playerController.exchangeUserCodeForAccessToken(code);
                yield this.playerController.fetchUserData(userId);
                isAuthorized = true;
            }
            return isAuthorized;
        });
    }
    sendMessage(mainWindow, message) {
        mainWindow.webContents.send('message-from-main', message);
    }
    generateIpcMessageHandlers(mainWindow, type) {
        if (type === 'AUTH') {
            this.sendMessage(mainWindow, {
                type: 'AUTH',
                body: this.playerController.isUserAuthenticated()
            });
        }
        else if (type === 'CURRENTLY_PLAYING') {
            this.sendMessage(mainWindow, {
                type: 'CURRENTLY_PLAYING',
                body: this.playerController.getCurrentlyPlayingTrack()
            });
        }
        else if (type === 'PLAYER_PREFERENCES') {
            this.sendMessage(mainWindow, {
                type: 'PLAYER_PREFERENCES',
                body: this.playerController.getPlayerPreferences()
            });
        }
        else if (type === 'TOGGLE_INCOGNITO') {
            const playerPreferences = this.playerController.getPlayerPreferences();
            this.playerController.setPlayerPreference('isIncognito', !playerPreferences.isIncognito);
            this.sendMessage(mainWindow, {
                type: 'PLAYER_PREFERENCES',
                body: this.playerController.getPlayerPreferences()
            });
        }
        else if (type === 'USER_DATA') {
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
exports.MainWindowGenerator = MainWindowGenerator;
//# sourceMappingURL=MainWindowGenerator.js.map
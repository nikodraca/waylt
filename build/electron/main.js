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
const electron_1 = require("electron");
const ElectronStore = require("electron-store");
const electron_util_1 = require("electron-util");
const SpotifyService_1 = require("./services/SpotifyService");
const SlackService_1 = require("./services/SlackService");
const MainWindowGenerator_1 = require("./generators/MainWindowGenerator");
const TrayGenerator_1 = require("./generators/TrayGenerator");
const PlayerController_1 = require("./controllers/PlayerController");
require('dotenv').config();
let mainWindow;
let tray;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    const store = new ElectronStore();
    if (electron_util_1.is.development) {
        store.clear();
    }
    const spotifyService = new SpotifyService_1.SpotifyService();
    const slackService = new SlackService_1.SlackService();
    const playerController = new PlayerController_1.PlayerController(spotifyService, slackService, store);
    playerController.hydrateAccessToken();
    const mainWindowGenerator = new MainWindowGenerator_1.MainWindowGenerator(playerController);
    mainWindow = mainWindowGenerator.createMainWindow();
    const trayGenerator = new TrayGenerator_1.TrayGenerator(mainWindow);
    tray = trayGenerator.createTray();
    electron_1.app.dock.hide();
}));
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
//# sourceMappingURL=main.js.map
const { Plugin } = require('powercord/entities');

const { ipcRenderer } = require('electron');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const tray = getModule([ 'setSystemTrayApplications' ], false);

const customTrayItems = [
  {name: "Reload",id: 'reload'},
  {name: "Relaunch",id: 'relaunch'}
];

let relaunchTray

module.exports = class TrayRestart extends Plugin {
    async startPlugin () {
        inject('reload-from-tray', tray, 'setSystemTrayApplications', () => [ customTrayItems ], true);

        relaunchTray = (_, id) => {
            if (id=='relaunch') DiscordNative.app.relaunch();
            else if (id=='reload') location.reload();
        };
        
        ipcRenderer.on('DISCORD_RELAUNCH_APPLICATION', relaunchTray);

        tray.setSystemTrayApplications(customTrayItems);
    }

    pluginWillUnload () {
        uninject('reload-from-tray');
        if (typeof relaunchTray === 'function') {
            ipcRenderer.removeListener('DISCORD_RELAUNCH_APPLICATION', relaunchTray);
        }
        tray.setSystemTrayApplications([]);
    }
};

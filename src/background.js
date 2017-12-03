// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var mainWindow;
var childProcessId;
var childProcess;

var setApplicationMenu = function () {
    var menus = [editMenuTemplate, devMenuTemplate];
    if (env.name !== 'production') {
        //menus.push(devMenuTemplate);
        Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
    }
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

app.on('ready', function () {
    if (env.name === 'production' || env.name === 'development') {
        const jarPath = __dirname + '\\..\\service\\backend.jar';
        /*const exec = require('child_process').exec;
         const childProcess = exec('start javaw -jar ' + jarPath + ' -Djava.library.path=C:\\GNOS\\dll',
            (error, stdout, stderr) => {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            }
        )
        childProcessId = childProcess.pid;
         console.log('Starting pid: ' + childProcessId);*/

        /*const { spawn } = require('child_process');
         const child = spawn('javaw -jar ' + jarPath + ' -Djava.library.path=C:\\GNOS\\dll');*/

        const exec = require('child_process').exec;
        const childProcess = exec('start "gnos_service" java' + ' -Djava.library.path=C:\\GNOS-Scheduler\\dll' + ' -jar ' + ' -Xms2048m -Xmx4096m ' + jarPath,
            (error, stdout, stderr) => {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            }
        )
    }
    setApplicationMenu();

    var mainWindow = createWindow('main', {
        width: 0,
        height: 0
    });
    mainWindow.maximize();
    //mainWindow.setFullScreen(true);

    mainWindow.loadURL('file://' + __dirname + '/app.html');

    if (env.name === 'development') {
        mainWindow.openDevTools();
    }
});

app.on('window-all-closed', function () {
    if (env.name === 'production' || env.name === 'development') {
        /*const exec = require('child_process').exec;
        console.log('Closing pid: ' + childProcessId);
        childProcess = exec('taskkill /pid ' + childProcessId,
         (error, stdout, stderr) => {
         console.log('stdout: ' + stdout);
         console.log('stderr: ' + stderr);
         if (error !== null) {
         console.log('exec error: ' + error);
         }
         }
         )*/

        const exec = require('child_process').exec;
        console.log('Closing pid: ' + childProcessId);
        childProcess = exec('TASKKILL /FI "WINDOWTITLE eq gnos_service"',
            (error, stdout, stderr) => {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            }
        )
    }
    app.quit();
});

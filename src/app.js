// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { LoginView } from './views/loginView';
import { DashBoardView } from './views/dashBoardView';
import { MainView } from './views/mainView';

import env from './env';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)

document.addEventListener('DOMContentLoaded', function () {
    var loginView = new LoginView();
    loginView.render({message: 'Welcome to GNOS'});
    loginView.on('login:successful', function(options){
        loginComplete();
    });
    $('#appWindow').html(loginView.$el);
    setTimeout(function(){
        loginComplete();
    }, 2000);

});

var loginComplete = () => {
    console.log("Login successful");
    loadProjectDashboard();
}

var loadProjectDashboard = () => {
    var dashboardView = new DashBoardView();
    dashboardView.render();
    $('#appWindow').html(dashboardView.$el);
    dashboardView.off('open:project');
    dashboardView.on('open:project', function(options) {
        loadProject(options);
    });
    dashboardView.on('reload', function(options) {
        loadProjectDashboard(options);
    });
}

var loadProject = (options) => {
    console.log('Opening project: ' + options.projectId)
    var mainView = new MainView({projectId: options.projectId});
    mainView.off('open:dashboard');
    mainView.on('open:dashboard', function (options) {
        loadProjectDashboard(options);
    })
    mainView.render();
    $('#appWindow').html(mainView.$el);
}

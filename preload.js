const { remote } = require('electron');
const { dialog, BrowserWindow } = remote;

window.remote = remote;
window.BrowserWindow = BrowserWindow;
window.dialog = dialog;
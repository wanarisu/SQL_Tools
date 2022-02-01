const { remote } = require('electron');
const { dialog, BrowserWindow } = remote;
const fs = require('fs');
const path = require('path');

window.remote = remote;
window.BrowserWindow = BrowserWindow;
window.dialog = dialog;
window.fs = fs;
window.path = path;
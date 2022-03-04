const { remote } = require('electron');
const { dialog, BrowserWindow } = remote;
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
// const config = require('./config.json');

window.remote = remote;
window.BrowserWindow = BrowserWindow;
window.dialog = dialog;
window.fs = fs;
window.path = path;
window.sqlite3 = sqlite3;

window.queryResultSet = new Object();
window.configData = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
window.db = new sqlite3.Database(configData.dbpath);
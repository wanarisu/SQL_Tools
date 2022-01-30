const { app, Menu, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    win = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            enableRemoteModule: true,
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    win.loadFile('index.html');
    return win.id;
}

function createMenu() {
    let menu_temp = [{
            label: 'File',
            submenu: [{
                    label: 'New',
                    click: () => {
                        createWindow();
                    }
                },
                { role: 'close' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        { role: 'editMenu' },
    ];

    let menu = Menu.buildFromTemplate(menu_temp);
    Menu.setApplicationMenu(menu);
}

createMenu();
app.whenReady().then(createWindow);
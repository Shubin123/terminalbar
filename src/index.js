const { app, BrowserWindow, TouchBar, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

const { TouchBarLabel } = TouchBar

const hidden = false;
const DEBUG = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    modal: true,
    frame: false,
    width: hidden? 1 : 800,
    height: hidden? 1 : 500, 
    
    useContentSize: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '.', 'terminal.html'), 
    protocol: 'file:',
    slashes: true
  }));


  mainWindow.setTouchBar(touchBar);

  if (DEBUG){
  mainWindow.webContents.openDevTools();
  }

  if (hidden)
  {
    mainWindow.setOpacity(0);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', () => {
    logger(mainWindow.getSize());
  })
}

const term = new TouchBarLabel({ label: '' })

ipcMain.on('update-touchbar', async (event, { text }) => {
  text = text.replace(/(\r\n|\n|\r)/gm, "");
  // logger(text.toString());
  term.label = text;
})

const touchBar = new TouchBar({
  items: [
    term,
  ]
})

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.webContents.focus();
    mainWindow.focus();
  }
});



function logger(...args)
{
  if (DEBUG)
  {
    console.log(args);
  }
}
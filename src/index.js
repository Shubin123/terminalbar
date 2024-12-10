const { app, BrowserWindow, TouchBar, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
// let touchBarLabel;
const { TouchBarLabel } = TouchBar

const hidden = false;
const DEBUG = true;
// Function to create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    modal: true,
    frame: false,
        
    title: 'TerminalBar',
    icon: path.join(__dirname, 'assets', 'logo.icns'),
    width: hidden? 1 : 800,
    height: hidden? 1 : 500, 
    
    useContentSize: true,
        // vibrancy:  'fullscreen-ui',
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      scrollBounce: true,
      defaultFontFamily: 'sansSerif',
      defaultFontSize: 18,
    },
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '.', 'terminal.html'), // route from src
    protocol: 'file:',
    slashes: true
  }));

  // const touchBar = createTouchBar();
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
    console.log(mainWindow.getSize());
  })
}

const term = new TouchBarLabel({ label: '' })

ipcMain.on('update-touchbar', async (event, { text }) => {
  text = text.replace(/(\r\n|\n|\r)/gm, "");
  // console.log(text.toString());
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


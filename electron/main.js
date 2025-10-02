import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let serverProcess;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../client/public/favicon.ico'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
  });

  // Start the backend server
  if (!isDev) {
    // Use the embedded Node.js executable from Electron
    const nodePath = process.execPath;
    const serverPath = path.join(process.resourcesPath, 'dist', 'index.js');
    
    console.log('Starting server with:', nodePath, serverPath);
    
    serverProcess = spawn(nodePath, [serverPath], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    serverProcess.on('error', (error) => {
      console.error('Server process error:', error);
    });
    
    serverProcess.on('exit', (code) => {
      console.log('Server process exited with code:', code);
    });
  }

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : 'http://localhost:5000';

  // In production, wait for server to be ready
  if (!isDev) {
    // Wait for server to start
    const waitForServer = async () => {
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds
      
      while (attempts < maxAttempts) {
        try {
          const response = await fetch('http://localhost:5000/api/products');
          if (response.ok) {
            console.log('Server is ready!');
            break;
          }
        } catch (error) {
          // Server not ready yet
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (attempts >= maxAttempts) {
        console.error('Server failed to start within 30 seconds');
        // Load a local error page or show error dialog
        dialog.showErrorBox('Server Error', 'Failed to start the application server. Please try restarting the application.');
      }
    };
    
    waitForServer().then(() => {
      mainWindow.loadURL(startUrl);
    });
  } else {
    mainWindow.loadURL(startUrl);
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About AccounTechNPR',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About AccounTechNPR',
              message: 'AccounTechNPR',
              detail: 'Professional Accounting & Inventory Management System\nVersion 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event listeners
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Kill server process
  if (serverProcess) {
    serverProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

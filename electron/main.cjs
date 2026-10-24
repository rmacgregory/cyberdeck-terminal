const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;
let backendServer = null;

// Inicializa o servidor backend integrado diretamente dentro do executável
async function initEmbeddedBackend() {
  try {
    // Carrega dinamicamente a engine do terminal multiplataforma
    const backendPath = path.join(__dirname, '../server-terminal.js');
    const { startTerminalServer } = await import(url.pathToFileURL(backendPath).href);
    backendServer = startTerminalServer({ port: 3001, quiet: false });
    console.log('[ELECTRON] Backend terminal integrado iniciado com sucesso na porta 3001.');
  } catch (err) {
    console.error('[ELECTRON] Erro ao iniciar backend embutido:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 620,
    title: 'Cyberdeck CRT Terminal',
    backgroundColor: '#050709',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      // Permite que o navegador retro embutido navegue em sites reais sem restrição de X-Frame-Options no app desktop
      webSecurity: false,
      sandbox: false,
    },
  });

  // Remove restrições de X-Frame-Options e CSP para que YouTube e outros sites funcionem no navegador embutido
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    callback({ cancel: false, responseHeaders });
  });

  // Mostra a janela suavemente assim que pronta para evitar flash branco
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const devUrl = process.env.ELECTRON_START_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    // Produção / Standalone: carrega a build empacotada do Vite
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Abre links externos no navegador padrão do sistema operacional
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith('http:') || targetUrl.startsWith('https:')) {
      shell.openExternal(targetUrl);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialização do ciclo de vida do Electron
app.whenReady().then(async () => {
  // Inicia o backend embutido primeiro
  await initEmbeddedBackend();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Finalização da aplicação
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendServer && typeof backendServer.close === 'function') {
    try {
      backendServer.close();
      console.log('[ELECTRON] Backend terminal encerrado.');
    } catch {}
  }
});

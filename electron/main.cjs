const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;
let backendServer = null;

// Configura o menu nativo do macOS para garantir atalhos de teclado (Cmd+C, Cmd+V, Cmd+Q)
function setupMacMenu() {
  if (process.platform === 'darwin') {
    const template = [
      {
        label: app.name || 'Cyberdeck CRT Terminal',
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          { role: 'close' },
        ],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
}

// Inicializa o servidor backend integrado diretamente dentro do executável
async function initEmbeddedBackend() {
  try {
    const backendPath = path.join(__dirname, '../server-terminal.js');
    const { startTerminalServer } = await import(url.pathToFileURL(backendPath).href);
    backendServer = startTerminalServer({ port: 3001, quiet: false });
    console.log('[ELECTRON] Backend terminal integrado iniciado com sucesso na porta 3001.');
  } catch (err) {
    console.warn('[ELECTRON] Aviso: Backend embutido não pôde ser iniciado diretamente:', err?.message || err);
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
    if (!details || !details.responseHeaders) {
      return callback({ cancel: false });
    }
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    callback({ cancel: false, responseHeaders });
  });

  // Mostra a janela suavemente assim que pronta para evitar flash branco
  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  // Fallback de segurança para garantir exibição imediata caso ready-to-show atrase
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 1200);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[ELECTRON] Falha ao carregar conteúdo:', errorCode, errorDescription);
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  const devUrl = process.env.ELECTRON_START_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    // Produção / Standalone: carrega a build empacotada do Vite
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('[ELECTRON] Erro ao abrir index.html:', err);
    });
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
app.whenReady().then(() => {
  setupMacMenu();

  // Exibe a interface gráfica imediatamente para o usuário
  createWindow();

  // Inicia o backend embutido em paralelo sem bloquear a abertura da janela
  initEmbeddedBackend().catch((err) => {
    console.warn('[ELECTRON] Erro assíncrono no backend embutido:', err);
  });

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

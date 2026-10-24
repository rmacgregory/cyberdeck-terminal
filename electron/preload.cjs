const { contextBridge } = require('electron');

// Expõe dados seguros do ambiente desktop para a aplicação web
contextBridge.exposeInMainWorld('cyberdeckDesktop', {
  isElectron: true,
  platform: process.platform,
  arch: process.arch,
  electronVersion: process.versions.electron,
  nodeVersion: process.versions.node,
  backendPort: 3001,
});

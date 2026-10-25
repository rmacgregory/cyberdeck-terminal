/**
 * CYBERDECK UNIVERSAL TERMINAL BACKEND (Cross-Platform)
 * Suporte nativo completo para Windows (PowerShell / CMD), Linux (Bash / Sh) e macOS (Zsh / Bash).
 * Bridge com soquetes TCP brutos (TELNET com RFC 854) e SSH2 interativo.
 * Pode ser executado via CLI direta ou acoplado internamente ao Electron.
 */

import { spawn } from 'child_process';
import net from 'net';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { Client as SshClient } from 'ssh2';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Processador Telnet RFC 854 (Negociação de opções com switches e roteadores)
function processTelnetNegotiation(socket, chunk) {
  const cleanBytes = [];
  let i = 0;
  while (i < chunk.length) {
    if (chunk[i] === 255) { // IAC
      const cmd = chunk[i + 1];
      if (cmd === 251 || cmd === 252 || cmd === 253 || cmd === 254) {
        const opt = chunk[i + 2];
        i += 3;
        try {
          if (cmd === 253) { // DO -> responder WILL se for ECHO(1) ou SGA(3)
            socket.write(Buffer.from([255, (opt === 1 || opt === 3) ? 251 : 252, opt]));
          } else if (cmd === 251) { // WILL -> responder DO para ECHO(1) ou SGA(3)
            socket.write(Buffer.from([255, (opt === 1 || opt === 3) ? 253 : 254, opt]));
          } else if (cmd === 254) { // DONT -> responder WONT
            socket.write(Buffer.from([255, 252, opt]));
          } else if (cmd === 252) { // WONT -> responder DONT
            socket.write(Buffer.from([255, 254, opt]));
          }
        } catch {}
        continue;
      } else if (cmd === 250) { // Subnegociação SB ... SE
        let j = i + 2;
        while (j < chunk.length && !(chunk[j] === 255 && chunk[j + 1] === 240)) j++;
        i = j + 2;
        continue;
      } else {
        i += 2;
        continue;
      }
    } else {
      cleanBytes.push(chunk[i]);
      i++;
    }
  }
  return Buffer.from(cleanBytes).toString('utf-8');
}

let prevCpuTimes = null;

function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramPercent = Math.round((usedMem / totalMem) * 100);
  const ramUsedMb = Math.round(usedMem / (1024 * 1024));
  const ramTotalMb = Math.round(totalMem / (1024 * 1024));

  const cpus = os.cpus() || [];
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }

  let cpuPercent = 0;
  if (prevCpuTimes && total > prevCpuTimes.total) {
    const idleDiff = idle - prevCpuTimes.idle;
    const totalDiff = total - prevCpuTimes.total;
    cpuPercent = Math.max(0, Math.min(100, Math.round((1 - idleDiff / totalDiff) * 100)));
  }
  prevCpuTimes = { idle, total };

  return {
    cpu: cpuPercent,
    ramUsedMb,
    ramTotalMb,
    ramPercent,
    cores: cpus.length,
    uptime: Math.round(os.uptime()),
    hostname: os.hostname(),
    platform: process.platform,
  };
}

/**
 * Inicia o servidor backend
 * @param {object} options
 * @param {number} options.port Porta para o WebSocket/HTTP
 * @param {boolean} options.quiet Silenciar logs de inicialização
 */
export function startTerminalServer(options = {}) {
  const PORT = options.port || process.env.PORT || 3001;
  const quiet = options.quiet || false;

  const server = http.createServer((req, res) => {
    // Habilita CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/api/system-metrics' || req.url === '/api/metrics') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getSystemMetrics()));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      os: process.platform,
      arch: process.arch,
      system: os.type(),
      release: os.release(),
      hostname: os.hostname(),
      metrics: getSystemMetrics(),
    }));
  });

  const wss = new WebSocketServer({ server });

  // Stream periódico de telemetria real do sistema para todos os clientes conectados
  const metricsTimer = setInterval(() => {
    if (wss.clients.size === 0) return;
    const metrics = getSystemMetrics();
    const payload = JSON.stringify({
      type: 'system_metrics',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }, 1800);

  if (!quiet) {
    console.log('====================================================');
    console.log(' CYBERDECK // UNIVERSAL TERMINAL BACKEND');
    console.log(` Servidor ouvindo em: ws://127.0.0.1:${PORT}`);
    console.log(` Sistema operacional: ${os.type()} (${process.platform} - ${process.arch})`);
    console.log(` Shell nativa: ${isWindows ? 'PowerShell / CMD' : isMac ? 'Zsh / Bash' : 'Bash / Sh'}`);
    console.log(' Suporte nativo ativo: TELNET (RFC 854), SSH2, Local Shell');
    console.log('====================================================');
  }

  wss.on('connection', (ws) => {
    const username = os.userInfo ? os.userInfo().username : (process.env.USER || process.env.USERNAME || 'User');
    let currentCwd = process.cwd();

    console.log(`[+] Cliente conectado! Host: ${os.hostname()}, Usuário: ${username}, CWD: ${currentCwd}, OS: ${process.platform}`);

    let activeProcess = null;
    let activeTcpSocket = null;
    let activeSshClient = null;
    let activeSshStream = null;
    let pendingSshAuth = null;

    const send = (type, data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
      }
    };

    const closeRemoteSessions = (reason = '') => {
      pendingSshAuth = null;
      if (activeTcpSocket) {
        try { activeTcpSocket.destroy(); } catch {}
        activeTcpSocket = null;
      }
      if (activeSshStream) {
        try { activeSshStream.end(); } catch {}
        activeSshStream = null;
      }
      if (activeSshClient) {
        try { activeSshClient.end(); } catch {}
        activeSshClient = null;
      }
      if (reason) {
        send('dim', `[Conexão remota fechada: ${reason}]\r\n`);
        send('session_closed', { reason });
      }
    };

    // TELNET nativo com negociação RFC 854
    const startTelnet = (targetHost, targetPort) => {
      closeRemoteSessions();
      console.log(`[TELNET TCP] Abrindo conexão com ${targetHost}:${targetPort}`);
      send('info', `[TELNET] Conectando a ${targetHost}:${targetPort}...\r\n`);

      const socket = new net.Socket();
      activeTcpSocket = socket;
      socket.setTimeout(12000);

      socket.connect(targetPort, targetHost, () => {
        socket.setTimeout(0);
        console.log(`[TELNET CONECTADO] ${targetHost}:${targetPort}`);
        send('success', `[TELNET CONECTADO] Conexão aberta com ${targetHost}:${targetPort}\r\n`);
        send('session_started', { protocol: 'TELNET', target: `${targetHost}:${targetPort}` });
      });

      socket.on('data', (chunk) => {
        const text = processTelnetNegotiation(socket, chunk);
        if (text) send('stdout', text);
      });

      socket.on('timeout', () => {
        send('error', `[TELNET TIMEOUT] Host ${targetHost}:${targetPort} não respondeu.\r\n`);
        socket.destroy();
      });

      socket.on('error', (err) => {
        console.error(`[TELNET ERRO]:`, err.message);
        send('stderr', `[ERRO TELNET]: ${err.message}\r\n`);
        send('session_closed', { reason: err.message });
        activeTcpSocket = null;
      });

      socket.on('close', () => {
        send('warning', `[TELNET] Conexão encerrada pelo equipamento remoto.\r\n`);
        send('session_closed', { reason: 'Conexão encerrada' });
        activeTcpSocket = null;
      });
    };

    // SSH nativo com SSH2
    const startSsh = (targetHost, targetPort, targetUser, targetPassword) => {
      closeRemoteSessions();
      console.log(`[SSH2] Conectando a ${targetUser}@${targetHost}:${targetPort}`);
      send('info', `[SSH] Autenticando ${targetUser}@${targetHost}:${targetPort}...\r\n`);

      const conn = new SshClient();
      activeSshClient = conn;

      conn.on('ready', () => {
        console.log(`[SSH2 PRONTO] Autenticado com sucesso em ${targetHost}`);
        send('success', `[SSH CONECTADO] Sessão segura autenticada em ${targetHost}:${targetPort}\r\n`);
        send('session_started', { protocol: 'SSH', target: `${targetUser}@${targetHost}:${targetPort}` });

        conn.shell({ term: 'vt100', cols: 120, rows: 35 }, (err, stream) => {
          if (err) {
            send('stderr', `[ERRO SHELL SSH]: ${err.message}\r\n`);
            conn.end();
            return;
          }

          activeSshStream = stream;

          stream.on('data', (chunk) => send('stdout', chunk.toString('utf-8')));
          stream.stderr.on('data', (chunk) => send('stderr', chunk.toString('utf-8')));
          stream.on('close', () => {
            send('warning', `[SSH] Sessão SSH encerrada pelo host.\r\n`);
            send('session_closed', { reason: 'Sessão SSH finalizada' });
            activeSshStream = null;
            conn.end();
          });
        });
      });

      conn.on('error', (err) => {
        console.error(`[SSH2 ERRO]:`, err.message);
        send('stderr', `[ERRO SSH]: ${err.message}\r\n`);
        send('session_closed', { reason: err.message });
        activeSshClient = null;
      });

      conn.connect({
        host: targetHost,
        port: targetPort,
        username: targetUser,
        password: targetPassword,
        tryKeyboard: true,
        readyTimeout: 15000,
        algorithms: {
          kex: [
            'ecdh-sha2-nistp256',
            'ecdh-sha2-nistp384',
            'ecdh-sha2-nistp521',
            'diffie-hellman-group-exchange-sha256',
            'diffie-hellman-group14-sha256',
            'diffie-hellman-group14-sha1',
            'diffie-hellman-group-exchange-sha1',
            'diffie-hellman-group1-sha1'
          ],
          cipher: [
            'aes128-ctr', 'aes192-ctr', 'aes256-ctr',
            'aes128-gcm', 'aes256-gcm',
            'aes128-cbc', 'aes192-cbc', 'aes256-cbc',
            '3des-cbc'
          ],
          serverHostKey: [
            'ssh-ed25519',
            'ecdsa-sha2-nistp256',
            'ecdsa-sha2-nistp384',
            'ecdsa-sha2-nistp521',
            'rsa-sha2-512',
            'rsa-sha2-256',
            'ssh-rsa',
            'ssh-dss'
          ]
        }
      });
    };

    // Dados iniciais enviados para o cliente
    const osFriendlyName = isWindows ? 'Windows' : isMac ? 'macOS' : 'Linux';
    send('init', {
      path: currentCwd,
      home: os.homedir(),
      user: username,
      hostname: os.hostname(),
      os: `${osFriendlyName} (${os.type()} ${os.release()})`,
      platform: process.platform,
      arch: process.arch,
      shell: isWindows ? 'powershell' : (isMac ? 'zsh' : 'bash'),
    });

    send('stdout', `[BACKEND ATIVO] Host: ${os.hostname()} | SO: ${osFriendlyName} ${os.release()} (${process.platform}-${process.arch})\r\n`);
    send('prompt', { path: currentCwd });

    ws.on('message', (message) => {
      try {
        const msg = JSON.parse(message.toString());

        // 1. Entrada de dados / Comandos locais
        if (msg.type === 'stdin') {
          const rawCmd = msg.command !== undefined ? msg.command : '';

          // Aguardando senha do SSH
          if (pendingSshAuth) {
            const { host, port, user } = pendingSshAuth;
            pendingSshAuth = null;
            startSsh(host, port, user, rawCmd);
            return;
          }

          // Sessão TELNET ativa aberta
          if (activeTcpSocket && !activeTcpSocket.destroyed) {
            console.log(`[TELNET TX] > ${rawCmd}`);
            activeTcpSocket.write(rawCmd + '\r\n');
            return;
          }

          // Sessão SSH ativa aberta
          if (activeSshStream) {
            console.log(`[SSH TX] > ${rawCmd}`);
            activeSshStream.write(rawCmd + '\n');
            return;
          }

          // Execução local
          const command = rawCmd.trim();
          if (!command) return;

          const cmdParts = command.split(/\s+/);
          const lowerCmd = cmdParts[0].toLowerCase();

          // Interceptador TELNET
          if (lowerCmd === 'telnet') {
            const targetHost = cmdParts[1];
            const targetPort = parseInt(cmdParts[2], 10) || 23;
            if (!targetHost) {
              send('warning', 'Uso: telnet <host> [porta]\r\n');
              return;
            }
            startTelnet(targetHost, targetPort);
            return;
          }

          // Interceptador SSH
          if (lowerCmd === 'ssh') {
            const target = cmdParts[1];
            if (!target) {
              send('warning', 'Uso: ssh <host> ou ssh usuario@host\r\n');
              return;
            }
            let user = 'admin';
            let host = target;
            let port = 22;
            if (target.includes('@')) {
              const p = target.split('@');
              user = p[0];
              host = p[1];
            }
            for (let i = 2; i < cmdParts.length; i++) {
              if (cmdParts[i] === '-l' && cmdParts[i + 1]) { user = cmdParts[i + 1]; i++; }
              else if (cmdParts[i] === '-p' && cmdParts[i + 1]) { port = parseInt(cmdParts[i + 1], 10) || 22; i++; }
            }
            pendingSshAuth = { host, port, user };
            send('stdout', `[SSH] Conectando a ${user}@${host}:${port}...\r\n`);
            send('stdout', `Digite a senha para ${user}@${host}: `);
            send('ssh_auth_request', { host, port, user });
            return;
          }

          console.log(`[EXEC] (${process.platform}) > ${command}`);

          // Tratamento para comando 'cd' com suporte a ~ e caminhos relativos
          if (lowerCmd === 'cd') {
            let targetDir = cmdParts.length === 1 ? os.homedir() : command.slice(3).trim();
            if (targetDir === '~' || targetDir.startsWith('~/')) {
              targetDir = path.join(os.homedir(), targetDir.slice(1));
            } else if (targetDir === '~\\' && isWindows) {
              targetDir = os.homedir();
            }

            try {
              const resolved = path.resolve(currentCwd, targetDir);
              if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
                currentCwd = resolved;
                send('prompt', { path: currentCwd });
                send('stdout', `${currentCwd}\r\n`);
                return;
              } else {
                send('stderr', `Caminho especificado não encontrado: "${targetDir}"\r\n`);
                return;
              }
            } catch (e) {
              send('stderr', `Erro ao mudar diretório: ${e.message}\r\n`);
              return;
            }
          }

          // Execução de comando no shell nativo do sistema
          let safeCwd = (msg.path && fs.existsSync(msg.path)) ? msg.path : currentCwd;

          // Seleciona o shell correto conforme o SO e requisição do cliente
          let shellExecutable = true;
          if (isWindows) {
            if (msg.shell === 'powershell') {
              shellExecutable = 'powershell.exe';
            } else if (msg.shell === 'cmd') {
              shellExecutable = 'cmd.exe';
            }
          } else {
            // Linux / macOS: usa a shell do usuário (ex: /bin/bash, /bin/zsh)
            shellExecutable = process.env.SHELL || (isMac ? '/bin/zsh' : '/bin/bash');
          }

          const child = spawn(command, {
            shell: shellExecutable,
            cwd: safeCwd,
            env: {
              ...process.env,
              TERM: 'xterm-256color',
            },
          });

          child.stdout.on('data', (chunk) => send('stdout', chunk.toString()));
          child.stderr.on('data', (chunk) => send('stderr', chunk.toString()));
          child.on('error', (err) => send('stderr', `[ERRO DE PROCESSO]: ${err.message}\r\n`));
        }

        // 2. Mensagem direta de Telnet
        else if (msg.type === 'telnet') {
          startTelnet(msg.host, parseInt(msg.port, 10) || 23);
        }

        // 3. Mensagem direta de SSH
        else if (msg.type === 'ssh') {
          startSsh(msg.host, parseInt(msg.port, 10) || 22, msg.user || 'admin', msg.password || '');
        }

        // 4. Fechar sessão remota sob demanda (exit / Ctrl+C)
        else if (msg.type === 'close_session') {
          closeRemoteSessions('Encerrada pelo usuário');
        }
      } catch (e) {
        console.error('[ERRO PARSE]:', e);
      }
    });

    ws.on('close', () => {
      console.log('[-] Cliente desconectado.');
      closeRemoteSessions();
      if (activeProcess) {
        activeProcess.kill();
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    if (!quiet) {
      console.log(`Pronto! Aguardando conexões do terminal na porta ${PORT}`);
    }
  });

  return {
    server,
    wss,
    port: PORT,
    close: () => {
      wss.close();
      server.close();
    },
  };
}

// Inicia diretamente caso executado via CLI (node server-terminal.js)
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server-terminal.js') ||
  process.argv[1].endsWith('server-windows-terminal.js')
);

if (isMainModule) {
  startTerminalServer();
}

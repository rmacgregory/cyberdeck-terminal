/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TerminalLine,
  QuickSession,
  ConnectionLog,
  TerminalTheme,
  SessionState,
  CrtConfig,
  TypographyConfig,
  TerminalFontSize,
  TerminalLineSpacing,
  TerminalFontFamily,
} from './types';
import { RetroAudioEngine } from './utils/audio';
import { HeaderHud } from './components/HeaderHud';
import { TerminalScreen } from './components/TerminalScreen';
import { QuickSessionsPanel } from './components/QuickSessionsPanel';
import { ConnectionLogsPanel } from './components/ConnectionLogsPanel';
import { QuickSessionModal } from './components/QuickSessionModal';
import { IntegratedBrowser } from './components/IntegratedBrowser';
import { Terminal, Layers, Activity, Globe } from 'lucide-react';

const WELCOME_BANNER = `
   ______      __              ____             __  
  / ____/_  __/ /_  ___  _____/ __ \\___  _____/ /__
 / /   / / / / __ \\/ _ \\/ ___/ / / / _ \\/ ___/ //_/
/ /___/ /_/ / /_/ /  __/ /  / /_/ /  __/ /__/ ,<   
\\____/\\__, /_.___/\\___/_/  /_____/\\___/\\___/_/|_|  
     /____/                                        
  CYBERDECK // UNIVERSAL CRT TERMINAL
  [CROSS-PLATFORM: WINDOWS / LINUX / MACOS]
=========================================================`;

export default function App() {
  const [theme, setTheme] = useState<TerminalTheme>('green');
  const [crtConfig, setCrtConfig] = useState<CrtConfig>(() => {
    try {
      const saved = localStorage.getItem('CYBERDECK_CRT_CONFIG');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      mode: 'real',
      bloom: 'extreme',
      curvature: true,
      bezel: true,
      scanlines: true,
      jitter: false,
    };
  });

  const [typographyConfig, setTypographyConfig] = useState<TypographyConfig>(() => {
    try {
      const saved = localStorage.getItem('CYBERDECK_TYPOGRAPHY_CONFIG');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      family: 'share-tech',
      size: 'md',
      spacing: 'normal',
    };
  });

  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'terminal' | 'sessions' | 'logs'>('terminal');

  // Integrated Cyber-Net Web Browser
  const [isBrowserOpen, setIsBrowserOpen] = useState<boolean>(false);
  const [browserInitialUrl, setBrowserInitialUrl] = useState<string>('cyberdeck://home');

  // Terminal Lines
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Platform & Shell State
  const [detectedPlatform, setDetectedPlatform] = useState<string>(() => {
    if (typeof window !== 'undefined' && (window as any).cyberdeckDesktop?.platform) {
      return (window as any).cyberdeckDesktop.platform;
    }
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('mac')) return 'darwin';
      if (ua.includes('linux')) return 'linux';
      if (ua.includes('win')) return 'win32';
    }
    return 'win32';
  });
  const [currentUsername, setCurrentUsername] = useState<string>('User');
  const [systemInfoLabel, setSystemInfoLabel] = useState<string>('Local Host');
  const [shellType, setShellType] = useState<string>(() => {
    if (typeof window !== 'undefined' && (window as any).cyberdeckDesktop?.platform === 'darwin') return 'zsh';
    if (typeof window !== 'undefined' && (window as any).cyberdeckDesktop?.platform === 'linux') return 'bash';
    return 'powershell';
  });
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof navigator !== 'undefined' && (navigator.userAgent.includes('Mac') || navigator.userAgent.includes('Linux'))) {
      return '~';
    }
    return 'C:\\Users\\Admin';
  });
  const [sessionState, setSessionState] = useState<SessionState>('local_shell');
  const [remoteSessionName, setRemoteSessionName] = useState<string>('');
  const [pendingSsh, setPendingSsh] = useState<{ host: string; port: number; user: string } | null>(null);
  const [isPasswordInput, setIsPasswordInput] = useState<boolean>(false);

  // Backend Connection (Node.js WebSocket / Socket Bridge)
  const [backendUrl, setBackendUrl] = useState<string>(() => {
    return localStorage.getItem('CYBERDECK_BACKEND_URL') || 'ws://127.0.0.1:3001';
  });
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Saved Quick Sessions (0 initially as requested - only user-added sessions exist)
  const [sessions, setSessions] = useState<QuickSession[]>(() => {
    try {
      const saved = localStorage.getItem('CYBERDECK_QUICK_SESSIONS');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Real-time Connection Logs
  const [logs, setLogs] = useState<ConnectionLog[]>([]);

  // Sound Engine
  const audioRef = useRef<RetroAudioEngine>(new RetroAudioEngine());

  // Add Log helper
  const addLog = (
    level: ConnectionLog['level'],
    protocol: string,
    message: string,
    target?: string
  ) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog: ConnectionLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      level,
      protocol,
      target,
      message,
    };
    setLogs((prev) => [...prev.slice(-200), newLog]);
  };

  // Append line helper
  const appendLine = (
    text: string,
    type: TerminalLine['type'] = 'stdout',
    isHtml = false
  ) => {
    setLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type,
        text,
        isHtml,
      },
    ]);
  };

  // Attempt connecting to the local Node.js backend bridge
  const connectToBackend = (urlToConnect: string) => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }

    addLog('CONNECT', 'BACKEND', `Iniciando conexão com backend Node.js em ${urlToConnect}`);

    try {
      const socket = new WebSocket(urlToConnect);

      socket.onopen = () => {
        wsRef.current = socket;
        setBackendConnected(true);
        audioRef.current.playBeep(1200, 0.1);
        appendLine(`[LINK ESTABELECIDO] Conectado ao Backend Node.js (${urlToConnect})`, 'success');
        addLog('SUCCESS', 'BACKEND', `Link ativo com processo local em ${urlToConnect}`);
      };

      socket.onmessage = (event) => {
        audioRef.current.playKeyClick();
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init') {
            if (data.data?.path) {
              setCurrentPath(data.data.path);
            }
            if (data.data?.user) {
              setCurrentUsername(data.data.user);
              addLog('INFO', 'BACKEND', `Usuário do sistema: ${data.data.user}`);
            }
            if (data.data?.platform) {
              setDetectedPlatform(data.data.platform);
              if (data.data.platform === 'darwin') setShellType('zsh');
              else if (data.data.platform === 'linux') setShellType('bash');
            }
            if (data.data?.os) {
              setSystemInfoLabel(data.data.os);
            }
          } else if (data.type === 'prompt') {
            const newPath = data.data?.path || data.path;
            if (newPath) setCurrentPath(newPath);
          } else if (data.type === 'session_started') {
            setSessionState('remote_session');
            setRemoteSessionName(`${data.data?.protocol || 'REMOTE'}: ${data.data?.target || ''}`);
            setIsPasswordInput(false);
            setPendingSsh(null);
            addLog('SUCCESS', data.data?.protocol || 'NET', `Sessão ativa com ${data.data?.target}`);
          } else if (data.type === 'session_closed') {
            setSessionState('local_shell');
            setRemoteSessionName('');
            setIsPasswordInput(false);
            setPendingSsh(null);
            addLog('WARN', 'NET', `Sessão finalizada: ${data.data?.reason || ''}`);
          } else if (data.type === 'stdout' || data.type === 'output') {
            appendLine(data.data || data.text || '', 'stdout');
            addLog('DATA', 'SHELL', `RX: ${String(data.data || data.text).slice(0, 40)}`);
          } else if (data.type === 'stderr') {
            appendLine(data.data || data.text || '', 'error');
            addLog('ERR', 'SHELL', `ERR: ${String(data.data || data.text).slice(0, 40)}`);
          } else if (data.type === 'info') {
            appendLine(data.data || data.text || '', 'info');
          } else if (data.type === 'success') {
            appendLine(data.data || data.text || '', 'success');
          } else if (data.type === 'warning') {
            appendLine(data.data || data.text || '', 'warning');
          } else if (data.type === 'dim') {
            appendLine(data.data || data.text || '', 'dim');
          } else if (data.data !== undefined) {
            appendLine(String(data.data), 'stdout');
          } else {
            appendLine(String(event.data), 'stdout');
          }
        } catch {
          appendLine(String(event.data), 'stdout');
        }
      };

      socket.onerror = () => {
        setBackendConnected(false);
        addLog('WARN', 'BACKEND', `Backend Node.js offline em ${urlToConnect}. Modo cliente ativo.`);
      };

      socket.onclose = () => {
        setBackendConnected(false);
        wsRef.current = null;
        addLog('WARN', 'BACKEND', `Conexão fechada com ${urlToConnect}`);
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('ERR', 'BACKEND', `Erro ao conectar: ${msg}`);
      setBackendConnected(false);
    }
  };

  // Initialize Terminal on Mount
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);

    // Boot lines
    appendLine(WELCOME_BANNER, 'success');
    appendLine(`[SYS] Cyberdeck Universal CRT Terminal iniciado.`, 'info');
    appendLine(`[SYS] Sessões Rápidas: ${sessions.length} salvas (use [+ Adicionar] para cadastrar seus hosts).`, 'dim');
    appendLine(`[SYS] Link de comunicação: ${backendUrl}`, 'dim');
    appendLine(`Digite 'help' para ver os comandos ou envie comandos diretamente para o shell.`, 'stdout');
    appendLine('');

    addLog('INFO', 'INIT', 'Cyberdeck CRT Terminal iniciado');
    addLog('CONNECT', 'CLIENT', `Interface pronta para comandos locais e remotos`);

    // Try auto-connecting to local backend
    connectToBackend(backendUrl);

    const handleFirstClick = () => {
      audioRef.current.initContext();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // Update theme on body
  const handleThemeChange = (newTheme: TerminalTheme) => {
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    appendLine(`[+] Paleta CRT atualizada para: ${newTheme.toUpperCase()}`, 'success');
    addLog('INFO', 'CONFIG', `Tema CRT alterado para ${newTheme.toUpperCase()}`);
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    audioRef.current.enabled = next;
    appendLine(`[*] Áudio de teclas ${next ? 'ATIVADO' : 'DESATIVADO'}`, 'info');
  };

  const updateCrtConfig = (newVals: Partial<CrtConfig>) => {
    setCrtConfig((prev) => {
      const updated = { ...prev, ...newVals };
      try {
        localStorage.setItem('CYBERDECK_CRT_CONFIG', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Sync font variable whenever family changes
  useEffect(() => {
    const fontMap: Record<TerminalFontFamily, string> = {
      'share-tech': "'Share Tech Mono', monospace",
      'vt323': "'VT323', monospace",
      'fira-code': "'Fira Code', monospace",
      'jetbrains': "'JetBrains Mono', monospace",
    };
    document.documentElement.style.setProperty('--term-font', fontMap[typographyConfig.family] || "'Share Tech Mono', monospace");
  }, [typographyConfig.family]);

  const handleTypographyConfigChange = (newVals: Partial<TypographyConfig>) => {
    setTypographyConfig((prev) => {
      const updated = { ...prev, ...newVals };
      try {
        localStorage.setItem('CYBERDECK_TYPOGRAPHY_CONFIG', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Save quick session
  const handleSaveSession = (newSession: Omit<QuickSession, 'id'>) => {
    const created: QuickSession = {
      ...newSession,
      id: `session-${Date.now()}`,
    };
    const updated = [...sessions, created];
    setSessions(updated);
    try {
      localStorage.setItem('CYBERDECK_QUICK_SESSIONS', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    audioRef.current.playBeep(1100, 0.08);
    appendLine(`[+] Novo acesso rápido salvo: ${created.name} (${created.protocol} -> ${created.ip})`, 'success');
    addLog('INFO', 'CONFIG', `Novo acesso rápido registrado: ${created.name} [${created.protocol}]`);
  };

  // Delete quick session
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    try {
      localStorage.setItem('CYBERDECK_QUICK_SESSIONS', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    appendLine(`[-] Acesso rápido removido`, 'dim');
    addLog('INFO', 'CONFIG', `Acesso rápido removido ID: ${id}`);
  };

  // Run quick session
  // Run quick session
  const handleSelectQuickSession = (session: QuickSession) => {
    setMobileTab('terminal');
    if (session.protocol === 'TELNET') {
      handleTelnetDispatch([session.ip, String(session.port || 23)]);
    } else if (session.protocol === 'SSH') {
      const user = session.user || 'admin';
      const port = session.port || 22;
      appendLine(`[SSH] Acesso rápido selecionado: ${session.name} (${user}@${session.ip}:${port})`, 'info');
      appendLine(`Digite a senha para ${user}@${session.ip}:`, 'stdout');
      setPendingSsh({ host: session.ip, port, user });
      setIsPasswordInput(true);
    } else if (session.protocol === 'PING') {
      executeCommandLine(`ping ${session.ip}`);
    } else if (session.protocol === 'SCAN') {
      executeCommandLine(`ping ${session.ip}`);
    } else if (session.protocol === 'RAW') {
      handleTelnetDispatch([session.ip, String(session.port || 8080)]);
    }
  };

  // Exit remote session
  const exitRemoteSession = (reason = 'Sessão encerrada') => {
    if (backendConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'close_session' }));
    }
    setSessionState('windows_shell');
    setRemoteSessionName('');
    setIsPasswordInput(false);
    setPendingSsh(null);
    appendLine(`[-] ${reason}. Retornado ao prompt do Windows.`, 'dim');
    addLog('WARN', 'DISCONNECT', `Sessão finalizada: ${reason}`);
  };

  // Command Execution Hub
  const executeCommandLine = (rawCommand: string) => {
    // If waiting for SSH password
    if (pendingSsh) {
      const { host, port, user } = pendingSsh;
      setPendingSsh(null);
      setIsPasswordInput(false);
      appendLine(`${user}@${host}'s password: ••••••••`, 'cmd');
      addLog('DATA', 'SSH', `Enviando credenciais para ${user}@${host}:${port}`);
      if (backendConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'ssh',
            host,
            port,
            user,
            password: rawCommand,
          })
        );
      }
      return;
    }

    const trimmed = rawCommand.trim();

    // If in remote session, empty line sends Enter to the remote device (e.g. Cisco prompt refresh)
    if (!trimmed) {
      if (sessionState === 'remote_session' && backendConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'stdin', command: '' }));
      }
      return;
    }

    // Save to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    audioRef.current.playBeep(920, 0.05);

    // If active remote session, forward input directly to the switch/SSH!
    if (sessionState === 'remote_session') {
      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        if (backendConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'stdin', command: trimmed }));
        }
        return;
      }
      if (backendConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'stdin', command: rawCommand }));
        addLog('DATA', 'REMOTE', `TX: ${trimmed}`);
        return;
      }
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Built-in terminal client commands
    if (cmd === 'cls' || cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === 'exit' || cmd === 'quit') {
      if (sessionState === 'remote_session') {
        exitRemoteSession('Sessão remota encerrada pelo usuário');
      } else {
        appendLine('Terminal Windows pronto. Sessão mantida ativa.', 'dim');
      }
      return;
    }

    if (cmd === 'help') {
      cmdHelp();
      return;
    }

    if (cmd === 'powershell' || cmd === 'pwsh') {
      setShellType('powershell');
      appendLine('Shell configurado para: Windows PowerShell (pwsh)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para PowerShell');
      return;
    }

    if (cmd === 'cmd') {
      setShellType('cmd');
      appendLine('Shell configurado para: Prompt de Comando do Windows (cmd.exe)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para CMD');
      return;
    }

    if (cmd === 'bash') {
      setShellType('bash');
      appendLine('Shell configurado para: GNU Bash (/bin/bash)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para Bash');
      return;
    }

    if (cmd === 'zsh') {
      setShellType('zsh');
      appendLine('Shell configurado para: Z Shell (/bin/zsh - macOS/Unix)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para Zsh');
      return;
    }

    if (cmd === 'sh') {
      setShellType('sh');
      appendLine('Shell configurado para: POSIX Shell (/bin/sh)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para Sh');
      return;
    }

    if (cmd === 'theme') {
      if (['green', 'amber', 'cyan', 'magenta'].includes(args[0]?.toLowerCase())) {
        handleThemeChange(args[0].toLowerCase() as TerminalTheme);
      } else {
        appendLine('Uso: theme <green | amber | cyan | magenta>', 'warning');
      }
      return;
    }

    if (cmd === 'crt') {
      const sub = args[0]?.toLowerCase();
      if (sub === 'real' || sub === 'tube' || sub === 'tubo') {
        updateCrtConfig({ mode: 'real' });
        appendLine('[*] Filtro CRT REAL ativado (Tubo curvo + Moldura Bezel + Fósforo vintage Cool-Retro-Term)', 'success');
      } else if (sub === 'subtle' || sub === 'leve' || sub === 'flat') {
        updateCrtConfig({ mode: 'subtle' });
        appendLine('[*] Filtro CRT LEVE ativado (Scanlines planas)', 'info');
      } else if (sub === 'off' || sub === 'desligar') {
        updateCrtConfig({ mode: 'off' });
        appendLine('[*] Filtro CRT DESATIVADO', 'dim');
      } else if (sub === 'bloom') {
        const nextBloom = crtConfig.bloom === 'extreme' ? 'normal' : crtConfig.bloom === 'normal' ? 'soft' : 'extreme';
        updateCrtConfig({ bloom: nextBloom });
        appendLine(`[*] Brilho do fósforo (Bloom): ${nextBloom.toUpperCase()}`, 'info');
      } else if (sub === 'bezel' || sub === 'moldura') {
        updateCrtConfig({ bezel: !crtConfig.bezel });
        appendLine(`[*] Moldura vintage do monitor (Bezel): ${!crtConfig.bezel ? 'LIGADA' : 'DESLIGADA'}`, 'info');
      } else if (sub === 'curve' || sub === 'curva') {
        updateCrtConfig({ curvature: !crtConfig.curvature });
        appendLine(`[*] Curvatura esférica do tubo: ${!crtConfig.curvature ? 'LIGADA' : 'DESLIGADA'}`, 'info');
      } else {
        const nextMode = crtConfig.mode === 'real' ? 'subtle' : crtConfig.mode === 'subtle' ? 'off' : 'real';
        updateCrtConfig({ mode: nextMode });
        appendLine(`[*] Modo CRT alternado para: ${nextMode.toUpperCase()}`, 'info');
        appendLine('Comandos: crt real | crt leve | crt off | crt bloom | crt bezel | crt curva', 'dim');
      }
      return;
    }

    if (cmd === 'font' || cmd === 'fonte' || cmd === 'typography') {
      const sub = args[0]?.toLowerCase();
      const val = args[1]?.toLowerCase();

      if (!sub) {
        appendLine('CONFIGURAÇÃO ATUAL DE TIPOGRAFIA:', 'info');
        appendLine(`• Família da Fonte : ${typographyConfig.family} (${typographyConfig.family === 'share-tech' ? 'Share Tech Mono' : typographyConfig.family === 'vt323' ? 'VT323 (DEC CRT)' : typographyConfig.family === 'fira-code' ? 'Fira Code' : 'JetBrains Mono'})`, 'stdout');
        appendLine(`• Tamanho da Fonte : ${typographyConfig.size.toUpperCase()} (${typographyConfig.size === 'sm' ? 'Pequena - 12px' : typographyConfig.size === 'md' ? 'Média - 14px' : 'Grande - 16px'})`, 'stdout');
        appendLine(`• Espaço Linhas    : ${typographyConfig.spacing.toUpperCase()} (${typographyConfig.spacing === 'tight' ? 'Compacto - 1.25x' : typographyConfig.spacing === 'loose' ? 'Espaçado - 1.95x' : 'Normal - 1.55x'})`, 'stdout');
        appendLine('Comandos disponíveis:', 'dim');
        appendLine('  font family <share | vt323 | fira | jetbrains>', 'dim');
        appendLine('  font size <pequena | media | grande | sm | md | lg>', 'dim');
        appendLine('  font space <compacto | normal | espacado | tight | normal | loose>', 'dim');
        appendLine('  font reset', 'dim');
        return;
      }

      if (sub === 'family' || sub === 'familia' || sub === 'face' || sub === 'tipo') {
        if (['share', 'share-tech', 'sharetech'].includes(val)) {
          handleTypographyConfigChange({ family: 'share-tech' });
          appendLine('[*] Fonte alterada para: Share Tech Mono (Cyberdeck HUD Militar)', 'success');
        } else if (['vt323', 'vt', 'dec', 'crt'].includes(val)) {
          handleTypographyConfigChange({ family: 'vt323' });
          appendLine('[*] Fonte alterada para: VT323 (DEC VT220 Retro Phosphor Tube 80s)', 'success');
        } else if (['fira', 'fira-code', 'firacode'].includes(val)) {
          handleTypographyConfigChange({ family: 'fira-code' });
          appendLine('[*] Fonte alterada para: Fira Code (Hacker Monospace)', 'success');
        } else if (['jetbrains', 'jetbrains-mono', 'jet'].includes(val)) {
          handleTypographyConfigChange({ family: 'jetbrains' });
          appendLine('[*] Fonte alterada para: JetBrains Mono (Alta Definição)', 'success');
        } else {
          appendLine('Uso: font family <share | vt323 | fira | jetbrains>', 'warning');
        }
        return;
      }

      if (sub === 'size' || sub === 'tamanho') {
        if (['sm', 'pequena', 'pequeno', 'small', '12', '1'].includes(val)) {
          handleTypographyConfigChange({ size: 'sm' });
          appendLine('[*] Tamanho da fonte definido para: PEQUENA (12px)', 'success');
        } else if (['md', 'media', 'medio', 'medium', '14', '2'].includes(val)) {
          handleTypographyConfigChange({ size: 'md' });
          appendLine('[*] Tamanho da fonte definido para: MÉDIA (14px - Padrão)', 'success');
        } else if (['lg', 'grande', 'large', '16', '3'].includes(val)) {
          handleTypographyConfigChange({ size: 'lg' });
          appendLine('[*] Tamanho da fonte definido para: GRANDE (16px)', 'success');
        } else {
          appendLine('Uso: font size <pequena | media | grande> (ou sm | md | lg)', 'warning');
        }
        return;
      }

      if (sub === 'space' || sub === 'spacing' || sub === 'espaco' || sub === 'espacamento' || sub === 'linhas') {
        if (['tight', 'compacto', 'denso', '1'].includes(val)) {
          handleTypographyConfigChange({ spacing: 'tight' });
          appendLine('[*] Espaçamento entre linhas definido para: COMPACTO (1.25x)', 'success');
        } else if (['normal', 'padrao', 'medio', '2'].includes(val)) {
          handleTypographyConfigChange({ spacing: 'normal' });
          appendLine('[*] Espaçamento entre linhas definido para: NORMAL (1.55x - Padrão)', 'success');
        } else if (['loose', 'espacado', 'amplo', 'aberto', '3'].includes(val)) {
          handleTypographyConfigChange({ spacing: 'loose' });
          appendLine('[*] Espaçamento entre linhas definido para: ESPAÇADO (1.95x)', 'success');
        } else {
          appendLine('Uso: font space <compacto | normal | espacado> (ou tight | normal | loose)', 'warning');
        }
        return;
      }

      if (sub === 'reset' || sub === 'padrao') {
        handleTypographyConfigChange({ family: 'share-tech', size: 'md', spacing: 'normal' });
        appendLine('[*] Tipografia restaurada para as configurações padrão de fábrica.', 'success');
        return;
      }

      // Quick direct shortcuts e.g. "font vt323", "font lg", "font loose"
      if (['share', 'share-tech', 'vt323', 'fira-code', 'fira', 'jetbrains'].includes(sub)) {
        const targetFam = sub === 'vt323' ? 'vt323' : sub.startsWith('fira') ? 'fira-code' : sub.startsWith('jet') ? 'jetbrains' : 'share-tech';
        handleTypographyConfigChange({ family: targetFam });
        appendLine(`[*] Fonte alterada para: ${targetFam}`, 'success');
        return;
      }
      if (['sm', 'md', 'lg', 'pequena', 'media', 'grande'].includes(sub)) {
        const targetSize = ['sm', 'pequena'].includes(sub) ? 'sm' : ['lg', 'grande'].includes(sub) ? 'lg' : 'md';
        handleTypographyConfigChange({ size: targetSize });
        appendLine(`[*] Tamanho da fonte alterado para: ${targetSize.toUpperCase()}`, 'success');
        return;
      }
      if (['tight', 'normal', 'loose', 'compacto', 'espacado'].includes(sub)) {
        const targetSpace = ['tight', 'compacto'].includes(sub) ? 'tight' : ['loose', 'espacado'].includes(sub) ? 'loose' : 'normal';
        handleTypographyConfigChange({ spacing: targetSpace });
        appendLine(`[*] Espaço entre linhas alterado para: ${targetSpace.toUpperCase()}`, 'success');
        return;
      }

      appendLine(`Comando '${sub}' não reconhecido. Digite 'font' para ver o manual.`, 'warning');
      return;
    }

    if (cmd === 'browser' || cmd === 'web' || cmd === 'net' || cmd === 'surf' || cmd === 'navegador' || cmd === 'internet') {
      const targetUrl = args.join(' ');
      if (targetUrl) {
        setBrowserInitialUrl(targetUrl);
      }
      setIsBrowserOpen(true);
      appendLine(`[*] Navegador integrado Cyber-Net aberto${targetUrl ? ` em: ${targetUrl}` : ''}. Efeito CRT sincronizado.`, 'success');
      return;
    }

    if (cmd === 'youtube' || cmd === 'yt') {
      const vid = args[0] || 'jfKfPfyJRdk';
      const targetUrl = vid.includes('http') ? vid : `https://www.youtube.com/watch?v=${vid}`;
      setBrowserInitialUrl(targetUrl);
      setIsBrowserOpen(true);
      appendLine(`[*] Player YouTube CRT iniciado com: ${targetUrl}`, 'success');
      return;
    }

    if (cmd === 'download' || cmd === 'baixar' || cmd === 'html') {
      appendLine('[+] Baixando arquivo portátil offline atualizado: cyberdeckterminalv2.html', 'success');
      if (typeof window !== 'undefined') {
        const a = document.createElement('a');
        a.href = '/cyberdeckterminalv2.html';
        a.download = 'cyberdeckterminalv2.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return;
    }

    if (cmd === 'history') {
      history.forEach((h, i) => appendLine(`${i + 1}  ${h}`, 'dim'));
      return;
    }

    if (cmd === 'backend') {
      if (args[0]) {
        const newUrl = args[0];
        setBackendUrl(newUrl);
        localStorage.setItem('CYBERDECK_BACKEND_URL', newUrl);
        appendLine(`[CONFIG] URL do Backend Node.js definida para: ${newUrl}`, 'success');
        connectToBackend(newUrl);
      } else {
        appendLine(`Backend configurado: ${backendUrl} (${backendConnected ? 'CONECTADO' : 'DESCONECTADO'})`, 'info');
        appendLine(`Para alterar: backend ws://localhost:3001`, 'dim');
      }
      return;
    }

    if (cmd === 'reconnect' || (cmd === 'connect' && (!args[0] || args[0].startsWith('ws://') || args[0].startsWith('http://')))) {
      const targetUrl = args[0] || backendUrl;
      appendLine(`Reconectando ao backend Node.js em ${targetUrl}...`, 'info');
      connectToBackend(targetUrl);
      return;
    }

    // Direct Remote Protocols dispatch (SSH / Telnet / Ping)
    if (cmd === 'ssh') {
      handleSshDispatch(args);
      return;
    }

    if (cmd === 'telnet') {
      handleTelnetDispatch(args);
      return;
    }

    if (cmd === 'ping') {
      handlePingDispatch(args[0] || '127.0.0.1');
      return;
    }

    // If backend WebSocket is connected, forward the real command directly to the Windows process!
    if (backendConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      addLog('DATA', 'TX', `Comando enviado ao processo Windows: ${trimmed}`);
      wsRef.current.send(
        JSON.stringify({
          type: 'stdin',
          shell: shellType,
          command: trimmed,
          path: currentPath,
        })
      );
      return;
    }

    // If backend is not currently connected:
    handleOfflineDispatch(trimmed, cmd, args);
  };

  const handleSshDispatch = (args: string[]) => {
    if (args.length === 0) {
      appendLine('Uso: ssh <host> [-l usuario] [-p porta] ou ssh usuario@host', 'warning');
      return;
    }

    let user = 'admin';
    let host = '';
    let port = 22;

    const target = args[0];
    if (target.includes('@')) {
      const parts = target.split('@');
      user = parts[0];
      host = parts[1];
    } else {
      host = target;
    }

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-l' && args[i + 1]) {
        user = args[i + 1];
        i++;
      } else if (args[i] === '-p' && args[i + 1]) {
        port = parseInt(args[i + 1], 10) || 22;
        i++;
      }
    }

    if (!backendConnected) {
      appendLine(`[AVISO] Backend Node.js offline. Inicie 'node server-windows-terminal.js' no Windows.`, 'error');
      return;
    }

    audioRef.current.playCarrierTone();
    appendLine(`[SSH] Conectando a ${user}@${host}:${port}...`, 'info');
    appendLine(`Digite a senha para ${user}@${host}:`, 'stdout');
    setPendingSsh({ host, port, user });
    setIsPasswordInput(true);
    addLog('CONNECT', 'SSH', `Solicitando autenticação para ${user}@${host}:${port}`, host);
  };

  const handleTelnetDispatch = (args: string[]) => {
    if (args.length === 0) {
      appendLine('Uso: telnet <host> [porta]', 'warning');
      return;
    }
    const host = args[0];
    const port = args[1] ? parseInt(args[1], 10) : 23;

    if (!backendConnected) {
      appendLine(`[AVISO] Backend Node.js offline em ${backendUrl}.`, 'error');
      appendLine(`Inicie o backend no Windows ('node server-windows-terminal.js') para abrir o soquete TCP.`, 'dim');
      return;
    }

    audioRef.current.playCarrierTone();
    appendLine(`[TELNET] Conectando a ${host}:${port}...`, 'info');
    addLog('CONNECT', 'TELNET', `Abrindo socket TCP raw -> ${host}:${port}`, host);

    wsRef.current?.send(
      JSON.stringify({
        type: 'telnet',
        host,
        port,
      })
    );
  };

  const handlePingDispatch = (target: string) => {
    audioRef.current.playCarrierTone();
    appendLine(`Disparando ${target} com 32 bytes de dados:`, 'info');
    addLog('CONNECT', 'ICMP', `Iniciando teste de conectividade com ${target}`, target);

    if (backendConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'stdin',
          shell: shellType,
          command: `ping ${target}`,
          path: currentPath,
        })
      );
    } else {
      // Local client network check
      const start = performance.now();
      appendLine(`Disparando teste de alcance ICMP/Host para ${target}...`, 'dim');

      fetch(`https://${target}`, { mode: 'no-cors' })
        .then(() => {
          const rtt = (performance.now() - start).toFixed(1);
          appendLine(`Resposta de ${target}: tempo=${rtt}ms`, 'success');
          addLog('SUCCESS', 'ICMP', `Host ${target} respondeu em ${rtt}ms`, target);
        })
        .catch(() => {
          const rtt = (performance.now() - start).toFixed(1);
          appendLine(`Host ${target} contatado (latência de rota: ${rtt}ms)`, 'stdout');
          addLog('DATA', 'ICMP', `Sonda para ${target} finalizada em ${rtt}ms`, target);
        });
    }
  };

  const handleOfflineDispatch = (commandLine: string, cmd: string, args: string[]) => {
    addLog('DATA', 'CLIENT', `Comando local: ${commandLine}`);

    if (cmd === 'dir' || cmd === 'ls') {
      appendLine(` Diretório de ${currentPath}`, 'dim');
      appendLine('');
      appendLine('  Modo                Comprimento Nome', 'dim');
      appendLine('  ----                ----------- ----', 'dim');
      appendLine('  d-----        22/10/2026  12:00 Desktop', 'stdout');
      appendLine('  d-----        22/10/2026  12:00 Documents', 'stdout');
      appendLine('  d-----        22/10/2026  12:00 Downloads', 'stdout');
      appendLine('  -a----        22/10/2026  12:05 server-windows-terminal.js', 'success');
      appendLine('  -a----        22/10/2026  12:05 package.json', 'stdout');
      appendLine('');
      return;
    }

    if (cmd === 'cd') {
      const target = args[0] || 'C:\\Users\\Admin';
      if (target === '..') {
        const parts = currentPath.split('\\');
        if (parts.length > 1) {
          parts.pop();
          const newPath = parts.join('\\') || 'C:\\';
          setCurrentPath(newPath);
          appendLine(newPath, 'dim');
        }
      } else {
        const newPath = target.startsWith('C:') ? target : `${currentPath}\\${target}`;
        setCurrentPath(newPath);
        appendLine(newPath, 'dim');
      }
      return;
    }

    if (cmd === 'ipconfig') {
      appendLine('Configuração de IP do Windows', 'info');
      appendLine('');
      appendLine('Adaptador Ethernet Ethernet0:', 'dim');
      appendLine('   Sufixo DNS específico de conexão. . . : localdomain', 'stdout');
      appendLine('   Endereço IPv4. . . . . . . .  . . . . : 192.168.1.100', 'success');
      appendLine('   Máscara de Sub-rede . . . . . . . . . : 255.255.255.0', 'stdout');
      appendLine('   Gateway Padrão. . . . . . . . . . . . : 192.168.1.1', 'stdout');
      addLog('DATA', 'NET', 'Consulta de interfaces de rede executada');
      return;
    }

    if (cmd === 'whoami') {
      appendLine('DESKTOP-CYBER\\Admin', 'info');
      return;
    }

    if (cmd === 'echo') {
      appendLine(args.join(' '), 'stdout');
      return;
    }

    if (cmd === 'systeminfo') {
      const isDesktop = typeof window !== 'undefined' && (window as any).cyberdeckDesktop?.isElectron;
      const arch = isDesktop && (window as any).cyberdeckDesktop?.arch
        ? `${(window as any).cyberdeckDesktop.arch} (64-bit Nativo Desktop)`
        : 'x64 (Browser / V8 Engine)';
      appendLine(`Nome do Host:                      ${currentUsername}-CYBERDECK`, 'stdout');
      appendLine(`Nome do SO:                        ${systemInfoLabel}`, 'stdout');
      appendLine(`Plataforma / Arquitetura:          ${detectedPlatform} / ${arch}`, 'success');
      appendLine(`Interpretador Shell Atual:         ${shellType.toUpperCase()}`, 'stdout');
      appendLine(`Diretório Atual:                   ${currentPath}`, 'stdout');
      appendLine(`Backend:                           ${backendConnected ? 'Conectado (ws://127.0.0.1:3001)' : 'Offline / Standalone'}`, 'stdout');
      return;
    }

    appendLine(`'${commandLine}' enviado para o terminal.`, 'stdout');
    appendLine(`[INFO] Para execução direta no shell nativo, inicie o backend Node.js ('node server-terminal.js') e use 'reconnect'.`, 'dim');
  };

  const cmdHelp = () => {
    appendLine(`CYBERDECK // COMANDOS DO TERMINAL MULTIPLATAFORMA:`, 'info');
    appendLine(`--------------------------------------------------------------------------------`, 'dim');
    appendLine(`• powershell / cmd / bash / zsh : Alterna o interpretador de comandos.`, 'stdout');
    appendLine(`• ssh <host> [-l user] [-p port] : Cliente SSH interativo com autenticação segura.`, 'stdout');
    appendLine(`• telnet <host> [porta]    : Conecta a switches/roteadores (porta 23 TCP com RFC 854).`, 'stdout');
    appendLine(`• ping <host/ip>           : Mede latência e conectividade de rede.`, 'stdout');
    appendLine(`• backend [url]            : Configura a URL do WebSocket do backend Node.js.`, 'stdout');
    appendLine(`• reconnect                : Reconecta ao backend Node.js local.`, 'stdout');
    appendLine(`• theme <cor>              : Altera o fósforo CRT [green | amber | cyan | magenta].`, 'stdout');
    appendLine(`• crt [real|leve|off|bloom] : Filtro tubo CRT vintage (Cool-Retro-Term), scanlines e bloom.`, 'stdout');
    appendLine(`• font [family|size|space] : Tipografia CRT: 4 fontes temáticas, 3 tamanhos e 3 espaçamentos.`, 'stdout');
    appendLine(`• browser / web / surf <url> : Abre navegador integrado na tela com efeito CRT sincronizado.`, 'stdout');
    appendLine(`• dir / ls, cd, ifconfig   : Comandos padrão do shell local.`, 'stdout');
    appendLine(`• exit                     : Desconecta de sessões remotas.`, 'stdout');
    appendLine(`--------------------------------------------------------------------------------`, 'dim');
    appendLine(`Cadastre seus servidores e switches no painel lateral [SESSÕES RÁPIDAS]!`, 'warning');
  };

  // Keyboard navigation & Enter submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    audioRef.current.playKeyClick();

    if (e.key === 'Enter') {
      e.preventDefault();
      const current = inputValue;
      setInputValue('');

      // Freeze command into terminal output
      const prefix = getPromptPrefix();
      appendLine(`${prefix} ${current}`, 'cmd');

      executeCommandLine(current);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      let newIdx = historyIndex === -1 ? history.length - 1 : historyIndex - 1;
      if (newIdx < 0) newIdx = 0;
      setHistoryIndex(newIdx);
      setInputValue(history[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      const newIdx = historyIndex + 1;
      if (newIdx >= history.length) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        setHistoryIndex(newIdx);
        setInputValue(history[newIdx] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputValue.trim();
      const baseCommands = [
        'powershell',
        'pwsh',
        'cmd',
        'bash',
        'zsh',
        'sh',
        'dir',
        'ls',
        'cd',
        'ipconfig',
        'ifconfig',
        'ping',
        'ssh',
        'telnet',
        'backend',
        'reconnect',
        'theme',
        'crt',
        'font',
        'fonte',
        'browser',
        'web',
        'cls',
        'clear',
        'whoami',
        'systeminfo',
        'exit',
        'help',
      ];
      const match = baseCommands.find((c) => c.startsWith(current));
      if (match) {
        setInputValue(match + ' ');
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      appendLine('^C', 'warning');
      setInputValue('');
      if (sessionState === 'remote_session') {
        exitRemoteSession('Interrompido via ^C');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const getPromptPrefix = () => {
    if (isPasswordInput) {
      return '';
    }
    if (sessionState === 'remote_session') {
      return '> ';
    }
    if (shellType === 'bash' || shellType === 'zsh' || shellType === 'sh' || detectedPlatform === 'darwin' || detectedPlatform === 'linux') {
      const formattedPath = currentPath.replace(/^\/Users\/[^/]+|^\/home\/[^/]+/, '~');
      return `${currentUsername}@cyberdeck:${formattedPath}$ `;
    }
    if (shellType === 'powershell') {
      return `PS ${currentPath}> `;
    }
    return `${currentPath}> `;
  };

  const getPromptColorClass = () => {
    if (sessionState === 'remote_session') return 'text-cyan-400';
    if (shellType === 'powershell') return 'text-emerald-400';
    if (shellType === 'bash' || shellType === 'zsh') return 'text-cyan-300';
    return 'text-white';
  };

  const getActiveProtocolName = () => {
    if (sessionState === 'remote_session') return remoteSessionName.toUpperCase();
    if (shellType === 'bash') return 'GNU BASH';
    if (shellType === 'zsh') return 'Z SHELL';
    if (shellType === 'sh') return 'POSIX SH';
    return shellType === 'powershell' ? 'POWERSHELL' : 'CMD.EXE';
  };

  // Full inner Cyberdeck UI content
  const appContent = (
    <div className="relative z-10 flex-1 flex flex-col min-h-0 w-full">
      {/* Top Cyberpunk HUD Bar */}
      <HeaderHud
        theme={theme}
        onThemeChange={handleThemeChange}
        typographyConfig={typographyConfig}
        onTypographyConfigChange={handleTypographyConfigChange}
        sfxEnabled={sfxEnabled}
        onToggleSfx={handleToggleSfx}
        crtConfig={crtConfig}
        onCrtConfigChange={updateCrtConfig}
        activeProtocolName={getActiveProtocolName()}
        sessionState={sessionState}
        backendConnected={backendConnected}
        isBrowserOpen={isBrowserOpen}
        onToggleBrowser={() => setIsBrowserOpen((prev) => !prev)}
      />

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center gap-1 mb-2 font-mono text-[11px] shrink-0">
        <button
          onClick={() => setMobileTab('terminal')}
          className={`flex-1 py-1 rounded border flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'terminal'
              ? 'border-current bg-white/10 font-bold'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>TERMINAL</span>
        </button>
        <button
          onClick={() => setMobileTab('sessions')}
          className={`flex-1 py-1 rounded border flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'sessions'
              ? 'border-current bg-white/10 font-bold'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>SESSÕES ({sessions.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('logs')}
          className={`flex-1 py-1 rounded border flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'logs'
              ? 'border-current bg-white/10 font-bold'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>LOGS ({logs.length})</span>
        </button>
        <button
          onClick={() => setIsBrowserOpen(true)}
          className="flex-1 py-1 rounded border border-current bg-white/10 hover:bg-white/20 text-current flex items-center justify-center gap-1.5 transition-colors font-bold"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>WEB</span>
        </button>
      </div>

      {/* Center Body: Terminal Workspace with Inline Typing + Right Sidebar */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
        {/* Main Terminal Screen */}
        <div className={`flex-1 flex flex-col min-h-0 ${mobileTab === 'terminal' ? 'flex' : 'hidden lg:flex'}`}>
          <TerminalScreen
            lines={lines}
            inputValue={inputValue}
            isPassword={isPasswordInput}
            promptPrefix={getPromptPrefix()}
            promptColorClass={getPromptColorClass()}
            onInputChange={setInputValue}
            onSubmit={executeCommandLine}
            onKeyDown={handleKeyDown}
            crtConfig={crtConfig}
            typographyConfig={typographyConfig}
          />
        </div>

        {/* Sidebar: Quick Sessions (Empty by default) + Real-Time Connection Logs */}
        <aside
          className={`w-full lg:w-80 flex-col gap-3 shrink-0 min-h-0 ${
            mobileTab === 'terminal' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Quick Sessions Panel */}
          <div className={`${mobileTab === 'sessions' ? 'flex flex-col flex-1' : mobileTab === 'logs' ? 'hidden lg:block' : 'block'}`}>
            <QuickSessionsPanel
              sessions={sessions}
              onSelectSession={handleSelectQuickSession}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onDeleteSession={handleDeleteSession}
            />
          </div>

          {/* Real-time Connection Log */}
          <div className={`${mobileTab === 'logs' ? 'flex flex-col flex-1' : mobileTab === 'sessions' ? 'hidden lg:flex lg:flex-1' : 'flex flex-col flex-1'}`}>
            <ConnectionLogsPanel logs={logs} onClear={() => setLogs([])} />
          </div>
        </aside>
      </div>

      {/* Bottom Hardware Footer */}
      <footer className="mt-2 pt-1 border-t border-zinc-900 flex flex-wrap items-center justify-between text-[10px] opacity-65 tracking-widest font-mono shrink-0">
        <div>TERMINAL: WINDOWS x64 // CYBERDECK FRONTEND</div>
        <div>PROTOCOLS: POWERSHELL • CMD • SSH • TELNET • TCP</div>
        <div>LOG STREAM: ATIVO</div>
      </footer>

      {/* Modal to add new Quick Session (Host, IP, Protocol, Port, User) */}
      <QuickSessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveSession}
      />

      {/* Integrated Cyber-Net Web Browser with Full CRT Filter Inheritance */}
      <IntegratedBrowser
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        theme={theme}
        crtConfig={crtConfig}
        initialUrl={browserInitialUrl}
        onRunTerminalCommand={(cmd) => {
          setIsBrowserOpen(false);
          executeCommandLine(cmd);
        }}
      />
    </div>
  );

  // REAL CRT MODE: Encapsulate the ENTIRE viewport screen inside the cathode tube & bezel chassis
  if (crtConfig.mode === 'real') {
    const screenElement = (
      <div
        className={`crt-real-screen flex-1 flex flex-col min-h-0 w-full h-full relative overflow-hidden p-2 sm:p-3 md:p-4 ${
          crtConfig.curvature ? 'crt-barrel-warp' : ''
        }`}
      >
        {/* Full-screen CRT Optical Layers */}
        {crtConfig.scanlines && <div className="crt-scanlines-real" />}
        {crtConfig.scanlines && <div className="crt-aperture-grille" />}
        <div className="crt-glass-glare" />
        <div className="crt-vignette-layer" />
        <div className="crt-refresh-bar" />

        {appContent}
      </div>
    );

    return (
      <div className="w-full h-screen bg-[#07090b] flex flex-col overflow-hidden select-text">
        {crtConfig.bezel ? (
          <div className="w-full h-full p-1 sm:p-2.5 md:p-3.5 flex flex-col min-h-0">
            <div className="crt-real-chassis flex-1 flex flex-col min-h-0 w-full h-full">
              <div className="crt-bezel-recess flex-1 flex flex-col min-h-0 w-full h-full">
                {screenElement}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-1 sm:p-2 flex flex-col min-h-0 bg-black">
            {screenElement}
          </div>
        )}
      </div>
    );
  }

  // SUBTLE CRT MODE: Scanline overlay on monitor background
  if (crtConfig.mode === 'subtle') {
    return (
      <div className="w-full h-screen flex flex-col p-2 sm:p-4 crt-monitor overflow-hidden select-text relative">
        <div className="crt-overlay"></div>
        {appContent}
      </div>
    );
  }

  // CRT OFF: Clean flat display
  return (
    <div className="w-full h-screen flex flex-col p-2 sm:p-4 bg-[#07090b] text-zinc-100 overflow-hidden select-text">
      {appContent}
    </div>
  );
}

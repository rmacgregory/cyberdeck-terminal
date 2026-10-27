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
  TerminalTab,
  SystemMetrics,
} from './types';
import { HeaderHud } from './components/HeaderHud';
import { TerminalTabsBar } from './components/TerminalTabsBar';
import { TerminalScreen } from './components/TerminalScreen';
import { QuickSessionsPanel } from './components/QuickSessionsPanel';
import { ConnectionLogsPanel } from './components/ConnectionLogsPanel';
import { QuickSessionModal } from './components/QuickSessionModal';
import { IntegratedBrowser } from './components/IntegratedBrowser';
import { getEquipmentCompletions } from './utils/equipmentCompletion';
import { audioSynthesizer } from './utils/audioEffects';
import {
  loadPersistentCommandHistory,
  savePersistentCommandHistory,
} from './utils/commandHistory';
import { Terminal, Layers, Activity, Globe, Columns, X } from 'lucide-react';

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
    let initialConfig: CrtConfig = {
      mode: 'off',
      bloom: 'normal',
      curvature: true,
      curvatureIntensity: 100,
      brightness: 120,
      vignetteIntensity: 35,
      cursorBlinkRate: 1.4,
      scanlines: false,
      jitter: false,
      jitterIntensity: 0,
      hertz: true,
      hertzSpeed: 15,
      hertzWidth: 100,
      hertzIntensity: 5,
      phosphorGhosting: true,
    };
    try {
      const saved = localStorage.getItem('CYBERDECK_CRT_CONFIG_V4');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed.bezel;
        // Padrão obrigatório ao abrir o programa: CRT OFF
        initialConfig = { ...initialConfig, ...parsed, mode: 'off' };
      }
    } catch {
      // Ignore
    }
    return initialConfig;
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

  // Telemetria Real do Sistema (CPU e RAM)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [mobileTab, setMobileTab] = useState<'terminal' | 'sessions' | 'logs'>('terminal');

  // Integrated Cyber-Net Web Browser (Alpha)
  const [isBrowserOpen, setIsBrowserOpen] = useState<boolean>(false);
  const [browserInitialUrl, setBrowserInitialUrl] = useState<string>('cyberdeck://home');

  // Platform State
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

  const defaultShell = (() => {
    if (typeof window !== 'undefined' && (window as any).cyberdeckDesktop?.platform === 'darwin') return 'zsh';
    if (typeof window !== 'undefined' && (window as any).cyberdeckDesktop?.platform === 'linux') return 'bash';
    return 'powershell';
  })();

  const defaultPath = (() => {
    if (typeof navigator !== 'undefined' && (navigator.userAgent.includes('Mac') || navigator.userAgent.includes('Linux'))) {
      return '~';
    }
    return 'C:\\Users\\Admin';
  })();

  const [systemInfoLabel, setSystemInfoLabel] = useState<string>('Local Host');

  // Backend URL (Node.js WebSocket Server)
  const [backendUrl, setBackendUrl] = useState<string>(() => {
    return localStorage.getItem('CYBERDECK_BACKEND_URL') || 'ws://127.0.0.1:3001';
  });

  // Dedicated WebSockets per Tab for simultaneous concurrent connections
  const tabSocketsRef = useRef<Map<string, WebSocket>>(new Map());

  // Factory function for clean tab creation
  const createNewTab = (
    id: string,
    title: string,
    protocol: TerminalTab['protocol'] = 'LOCAL',
    target?: string
  ): TerminalTab => {
    return {
      id,
      title,
      protocol,
      target,
      sessionState: 'local_shell',
      remoteSessionName: '',
      shellType: defaultShell,
      currentPath: defaultPath,
      currentUsername: 'User',
      lines: [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'success',
          text: WELCOME_BANNER,
        },
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'info',
          text: `[SESSÃO INICIADA] Aba: ${title} // Protocolo: ${protocol}`,
        },
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'dim',
          text: `Atalhos: Alt+T (Nova Aba) | Alt+W (Fechar Aba) | Alt+1..9 (Alternar Aba) | 'help' para ajuda`,
        },
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'stdout',
          text: '',
        },
      ],
      inputValue: '',
      history: loadPersistentCommandHistory(),
      historyIndex: -1,
      pendingSsh: null,
      isPasswordInput: false,
      backendConnected: false,
      hasUnread: false,
    };
  };

  // MULTI-TAB STATE
  const [tabs, setTabs] = useState<TerminalTab[]>(() => [
    createNewTab('tab-1', 'Console 1 - Local', 'LOCAL'),
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // SPLIT-SCREEN STATE
  const [isSplitScreen, setIsSplitScreen] = useState<boolean>(false);
  const [secondaryTabId, setSecondaryTabId] = useState<string | null>(null);

  // DEGAUSS (Desmagnetização da Bobina CRT) STATE
  const [isDegaussing, setIsDegaussing] = useState<boolean>(false);

  const triggerDegauss = () => {
    if (isDegaussing) return;
    setIsDegaussing(true);
    audioSynthesizer.playDegaussSound();
    setTimeout(() => {
      setIsDegaussing(false);
    }, 1750);
  };

  const toggleSplitScreen = () => {
    setIsSplitScreen((prev) => {
      const next = !prev;
      if (next) {
        const other = tabs.find((t) => t.id !== activeTabId);
        if (other) {
          setSecondaryTabId(other.id);
        } else {
          const newId = `tab-${Date.now()}`;
          const newTab = createNewTab(newId, `Console ${tabs.length + 1} - Split`, 'LOCAL');
          setTabs((curr) => [...curr, newTab]);
          setSecondaryTabId(newId);
        }
      }
      return next;
    });
  };

  // Keep fresh refs to active tab & tabs list for socket events
  const activeTabIdRef = useRef<string>('tab-1');
  activeTabIdRef.current = activeTabId;
  const tabsRef = useRef<TerminalTab[]>(tabs);
  tabsRef.current = tabs;

  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const secondaryTab = isSplitScreen
    ? tabs.find((t) => t.id === secondaryTabId) || tabs.find((t) => t.id !== activeTabId) || null
    : null;

  // Saved Quick Sessions
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

  // Append line to a specific tab
  const appendLineToTab = (
    tabId: string,
    text: string,
    type: TerminalLine['type'] = 'stdout',
    isHtml = false
  ) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === tabId) {
          const isBackground = tabId !== activeTabIdRef.current;
          return {
            ...t,
            hasUnread: isBackground ? true : t.hasUnread,
            lines: [
              ...t.lines,
              {
                id: `${Date.now()}-${Math.random()}`,
                type,
                text,
                isHtml,
              },
            ],
          };
        }
        return t;
      })
    );
  };

  // Append line to active tab
  const appendLine = (
    text: string,
    type: TerminalLine['type'] = 'stdout',
    isHtml = false
  ) => {
    appendLineToTab(activeTabIdRef.current, text, type, isHtml);
  };

  // Connect socket for a specific tab
  const connectTabSocket = (tabId: string, urlToConnect: string) => {
    const existing = tabSocketsRef.current.get(tabId);
    if (existing) {
      try {
        existing.close();
      } catch {}
      tabSocketsRef.current.delete(tabId);
    }

    try {
      const socket = new WebSocket(urlToConnect);
      tabSocketsRef.current.set(tabId, socket);

      socket.onopen = () => {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  backendConnected: true,
                }
              : t
          )
        );
        appendLineToTab(
          tabId,
          `[LINK ESTABELECIDO] Conectado ao Backend Node.js (${urlToConnect})`,
          'success'
        );
        addLog('SUCCESS', 'BACKEND', `Link ativo com processo local para aba ${tabId}`);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'system_metrics' && data.data) {
            setSystemMetrics(data.data);
          } else if (data.type === 'init') {
            setTabs((prev) =>
              prev.map((t) => {
                if (t.id === tabId) {
                  return {
                    ...t,
                    currentPath: data.data?.path || t.currentPath,
                    currentUsername: data.data?.user || t.currentUsername,
                    shellType:
                      data.data?.platform === 'darwin'
                        ? 'zsh'
                        : data.data?.platform === 'linux'
                        ? 'bash'
                        : t.shellType,
                  };
                }
                return t;
              })
            );
            if (data.data?.platform) setDetectedPlatform(data.data.platform);
            if (data.data?.os) setSystemInfoLabel(data.data.os);
          } else if (data.type === 'prompt') {
            const newPath = data.data?.path || data.path;
            if (newPath) {
              setTabs((prev) =>
                prev.map((t) => (t.id === tabId ? { ...t, currentPath: newPath } : t))
              );
            }
          } else if (data.type === 'session_started') {
            const proto = (data.data?.protocol || 'SSH') as any;
            const target = data.data?.target || '';
            setTabs((prev) =>
              prev.map((t) => {
                if (t.id === tabId) {
                  return {
                    ...t,
                    sessionState: 'remote_session',
                    remoteSessionName: `${proto}: ${target}`,
                    protocol: proto,
                    target,
                    title: `${proto}: ${target}`,
                    isPasswordInput: false,
                    pendingSsh: null,
                  };
                }
                return t;
              })
            );
            addLog('SUCCESS', proto, `Sessão ativa com ${target} na aba ${tabId}`, target);
          } else if (data.type === 'session_closed') {
            setTabs((prev) =>
              prev.map((t) => {
                if (t.id === tabId) {
                  return {
                    ...t,
                    sessionState: 'local_shell',
                    remoteSessionName: '',
                    protocol: 'LOCAL',
                    isPasswordInput: false,
                    pendingSsh: null,
                  };
                }
                return t;
              })
            );
            addLog('WARN', 'NET', `Sessão remota finalizada na aba ${tabId}: ${data.data?.reason || ''}`);
          } else if (data.type === 'stdout' || data.type === 'output') {
            appendLineToTab(tabId, data.data || data.text || '', 'stdout');
            addLog('DATA', 'SHELL', `RX [${tabId}]: ${String(data.data || data.text).slice(0, 40)}`);
          } else if (data.type === 'stderr') {
            appendLineToTab(tabId, data.data || data.text || '', 'error');
            addLog('ERR', 'SHELL', `ERR [${tabId}]: ${String(data.data || data.text).slice(0, 40)}`);
          } else if (data.type === 'info') {
            appendLineToTab(tabId, data.data || data.text || '', 'info');
          } else if (data.type === 'success') {
            appendLineToTab(tabId, data.data || data.text || '', 'success');
          } else if (data.type === 'warning') {
            appendLineToTab(tabId, data.data || data.text || '', 'warning');
          } else if (data.type === 'dim') {
            appendLineToTab(tabId, data.data || data.text || '', 'dim');
          } else if (data.data !== undefined) {
            appendLineToTab(tabId, String(data.data), 'stdout');
          } else {
            appendLineToTab(tabId, String(event.data), 'stdout');
          }
        } catch {
          appendLineToTab(tabId, String(event.data), 'stdout');
        }
      };

      socket.onerror = () => {
        setTabs((prev) =>
          prev.map((t) => (t.id === tabId ? { ...t, backendConnected: false } : t))
        );
      };

      socket.onclose = () => {
        setTabs((prev) =>
          prev.map((t) => (t.id === tabId ? { ...t, backendConnected: false } : t))
        );
        tabSocketsRef.current.delete(tabId);
      };
    } catch (err: unknown) {
      console.error(`Erro ao conectar aba ${tabId}:`, err);
    }
  };

  // Reconnect all open tabs or a specific tab to backend
  const connectAllTabs = (urlToConnect: string) => {
    tabsRef.current.forEach((t) => {
      connectTabSocket(t.id, urlToConnect);
    });
  };

  // Switch Active Tab
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, hasUnread: false } : t))
    );
  };

  // Create New Tab
  const handleNewTab = (title?: string, sessionToLaunch?: QuickSession) => {
    const newId = `tab-${Date.now()}`;
    const newTitle =
      title ||
      (sessionToLaunch
        ? `${sessionToLaunch.protocol}: ${sessionToLaunch.name || sessionToLaunch.ip}`
        : `Console ${tabs.length + 1}`);
    const proto = sessionToLaunch?.protocol;
    const initialProto: 'LOCAL' | 'SSH' | 'TELNET' | 'PING' | 'RAW' =
      proto === 'SSH' || proto === 'TELNET' || proto === 'PING' || proto === 'RAW'
        ? proto
        : 'LOCAL';
    const newTab = createNewTab(newId, newTitle, initialProto, sessionToLaunch?.ip);

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);

    // Conecta o socket dedicado para esta nova aba
    connectTabSocket(newId, backendUrl);

    // Se uma sessão foi fornecida para abrir diretamente na nova aba
    if (sessionToLaunch) {
      setTimeout(() => {
        dispatchSessionOnTab(newId, sessionToLaunch);
      }, 350);
    }
  };

  // Close Tab
  const handleCloseTab = (idToClose: string) => {
    if (tabs.length <= 1) {
      appendLine('[-] Impossível fechar a única aba aberta. Digite "clear" para limpar a tela.', 'warning');
      return;
    }

    // Fecha socket da aba
    const socket = tabSocketsRef.current.get(idToClose);
    if (socket) {
      try {
        socket.send(JSON.stringify({ type: 'close_session' }));
        socket.close();
      } catch {}
      tabSocketsRef.current.delete(idToClose);
    }

    const nextTabs = tabs.filter((t) => t.id !== idToClose);
    setTabs(nextTabs);

    if (activeTabId === idToClose) {
      const idx = tabs.findIndex((t) => t.id === idToClose);
      const nextActive = nextTabs[Math.max(0, idx - 1)] || nextTabs[0];
      if (nextActive) {
        setActiveTabId(nextActive.id);
      }
    }
  };

  // Rename Tab
  const handleRenameTab = (id: string, newTitle: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
    appendLineToTab(id, `[*] Aba renomeada para: "${newTitle}"`, 'info');
  };

  // Initialize Terminal on Mount
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);

    addLog('INFO', 'INIT', 'Cyberdeck CRT Terminal iniciado com suporte a múltiplas abas');
    addLog('CONNECT', 'CLIENT', `Interface pronta para conexões concorrentes`);

    // Auto-connect initial tab
    connectTabSocket('tab-1', backendUrl);

    // Consulta inicial das métricas reais do sistema
    const fetchInitialMetrics = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3001/api/system-metrics');
        if (res.ok) {
          const data = await res.json();
          setSystemMetrics(data);
        }
      } catch {
        // Backend offline ainda
      }
    };
    fetchInitialMetrics();
  }, []);

  // Global Keyboard Shortcuts (Alt+T, Alt+W, Alt+1..9)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Alt + T -> Nova Aba
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      }
      // Alt + W -> Fechar Aba Ativa
      if (e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (tabs.length > 1) {
          handleCloseTab(activeTabIdRef.current);
        }
      }
      // Alt + 1..9 -> Trocar para Aba
      if (e.altKey && !isNaN(Number(e.key))) {
        const idx = Number(e.key) - 1;
        if (tabs[idx]) {
          e.preventDefault();
          handleSelectTab(tabs[idx].id);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [tabs]);

  // Sincroniza dinamicamente as variáveis CSS de Brilho e Curvatura do Tubo CRT
  useEffect(() => {
    const brightnessVal = (crtConfig.brightness ?? 120) / 100;
    const curveIntensity = crtConfig.curvature ? (crtConfig.curvatureIntensity ?? 100) : 0;

    // Curvatura: 0% = plano (sem distorção); 50% = clássico retro; 100% = tubo esférico extremo
    const perspective = curveIntensity === 0 ? 99999 : Math.round(2000 - (curveIntensity / 100) * 1550);
    const scale = (1 - (curveIntensity / 100) * 0.032).toFixed(3);
    const radius = Math.round(4 + (curveIntensity / 100) * 36);

    const vignetteVal = (crtConfig.vignetteIntensity ?? 35) / 100;

    // Taxa de piscada do cursor: 0 = estático (solid / animation: none); > 0 = animado
    if (crtConfig.cursorBlinkRate === 0) {
      document.documentElement.style.setProperty('--term-cursor-animation', 'none');
      document.documentElement.style.setProperty('--term-cursor-blink-rate', '0s');
    } else {
      const rate = crtConfig.cursorBlinkRate ?? 1.4;
      document.documentElement.style.setProperty('--term-cursor-animation', `cursor-blink ${rate}s infinite`);
      document.documentElement.style.setProperty('--term-cursor-blink-rate', `${rate}s`);
    }

    // Nível de Tremor / Jitter do canhão de elétrons CRT
    const isJitterActive = crtConfig.jitter && (crtConfig.jitterIntensity ?? 0) > 0;
    const jitterIntensity = isJitterActive ? (crtConfig.jitterIntensity ?? 0) : 0;
    const jitterMaxPx = ((jitterIntensity / 100) * 3.5).toFixed(2);
    const jitterDuration = Math.max(0.04, Number((0.15 - (jitterIntensity / 100) * 0.1).toFixed(3)));

    if (jitterIntensity === 0) {
      document.documentElement.style.setProperty('--crt-jitter-animation', 'none');
      document.documentElement.style.setProperty('--crt-jitter-max', '0px');
    } else {
      document.documentElement.style.setProperty('--crt-jitter-max', `${jitterMaxPx}px`);
      document.documentElement.style.setProperty(
        '--crt-jitter-animation',
        `crt-jitter ${jitterDuration}s infinite steps(2, jump-none)`
      );
    }

    // Faixas de Hertz e Varredura Analógica (Roll Bars / 50Hz-60Hz)
    const isHertzActive = crtConfig.hertz && (crtConfig.hertzSpeed ?? 0) > 0;
    const hertzSpeed = isHertzActive ? (crtConfig.hertzSpeed ?? 15) : 0;
    const hertzWidth = crtConfig.hertzWidth ?? 100;
    const hertzIntensity = crtConfig.hertzIntensity ?? 5;
    const hertzDuration = Math.max(0.45, Number((15 * Math.pow(0.04, hertzSpeed / 100)).toFixed(2)));
    const hertzHeightPx = Math.round(25 + (hertzWidth / 100) * 395);
    const hertzSecondaryDelay = -(hertzDuration / 2).toFixed(2);
    const hertzOpacity = ((hertzIntensity / 100) * 0.85).toFixed(2);

    if (!isHertzActive || hertzIntensity === 0) {
      document.documentElement.style.setProperty('--crt-hertz-display', 'none');
      document.documentElement.style.setProperty('--crt-hertz-opacity', '0');
      document.documentElement.style.setProperty('--crt-hertz-animation-primary', 'none');
      document.documentElement.style.setProperty('--crt-hertz-animation-secondary', 'none');
    } else {
      document.documentElement.style.setProperty('--crt-hertz-display', 'block');
      document.documentElement.style.setProperty('--crt-hertz-opacity', String(hertzOpacity));
      document.documentElement.style.setProperty('--crt-hertz-height', `${hertzHeightPx}px`);
      document.documentElement.style.setProperty(
        '--crt-hertz-animation-primary',
        `crt-hertz-roll ${hertzDuration}s linear infinite`
      );
      document.documentElement.style.setProperty(
        '--crt-hertz-animation-secondary',
        `crt-hertz-roll ${hertzDuration}s linear infinite`
      );
      document.documentElement.style.setProperty(
        '--crt-hertz-delay-secondary',
        `${hertzSecondaryDelay}s`
      );
    }

    document.documentElement.style.setProperty('--crt-brightness', String(brightnessVal));
    document.documentElement.style.setProperty('--crt-perspective', `${perspective}px`);
    document.documentElement.style.setProperty('--crt-scale', String(scale));
    document.documentElement.style.setProperty('--crt-radius', `${radius}px`);
    document.documentElement.style.setProperty('--crt-vignette-opacity', String(vignetteVal));
  }, [
    crtConfig.brightness,
    crtConfig.curvature,
    crtConfig.curvatureIntensity,
    crtConfig.vignetteIntensity,
    crtConfig.cursorBlinkRate,
    crtConfig.jitter,
    crtConfig.jitterIntensity,
    crtConfig.hertz,
    crtConfig.hertzSpeed,
    crtConfig.hertzWidth,
    crtConfig.hertzIntensity,
  ]);

  // Update theme on body
  const handleThemeChange = (newTheme: TerminalTheme) => {
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    appendLine(`[+] Paleta CRT atualizada para: ${newTheme.toUpperCase()}`, 'success');
    addLog('INFO', 'CONFIG', `Tema CRT alterado para ${newTheme.toUpperCase()}`);
  };

  const updateCrtConfig = (newVals: Partial<CrtConfig>) => {
    setCrtConfig((prev) => {
      const updated = { ...prev, ...newVals };
      try {
        localStorage.setItem('CYBERDECK_CRT_CONFIG_V4', JSON.stringify(updated));
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
    document.documentElement.style.setProperty(
      '--term-font',
      fontMap[typographyConfig.family] || "'Share Tech Mono', monospace"
    );
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
    appendLine(
      `[+] Novo acesso rápido salvo: ${created.name} (${created.protocol} -> ${created.ip})`,
      'success'
    );
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

  // Dispatch Quick Session connection on a designated tab
  const dispatchSessionOnTab = (tabId: string, session: QuickSession) => {
    const socket = tabSocketsRef.current.get(tabId);
    if (session.protocol === 'TELNET') {
      appendLineToTab(tabId, `[TELNET] Conectando a ${session.ip}:${session.port || 23}...`, 'info');
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                protocol: 'TELNET',
                target: session.ip,
                deviceType: session.deviceType || 'auto',
                title: `TELNET: ${session.name || session.ip}`,
              }
            : t
        )
      );
      addLog('CONNECT', 'TELNET', `Abrindo socket TCP raw -> ${session.ip}:${session.port || 23}`, session.ip);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'telnet',
            host: session.ip,
            port: session.port || 23,
          })
        );
      } else {
        appendLineToTab(tabId, `[AVISO] Backend Node.js offline. Inicie o backend na porta 3001.`, 'warning');
      }
    } else if (session.protocol === 'SSH') {
      const user = session.user || 'admin';
      const port = session.port || 22;
      appendLineToTab(
        tabId,
        `[SSH] Acesso rápido selecionado: ${session.name} (${user}@${session.ip}:${port})`,
        'info'
      );

      // Autenticação direta com Chave Privada (PEM / OpenSSH)
      if (session.authType === 'key' && session.privateKey) {
        appendLineToTab(tabId, `[SSH] Autenticando com Chave Privada (PEM/OpenSSH)...`, 'dim');
        addLog('CONNECT', 'SSH', `Autenticando via Chave Privada em ${user}@${session.ip}:${port}`);
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  pendingSsh: null,
                  isPasswordInput: false,
                  protocol: 'SSH',
                  target: session.ip,
                  deviceType: session.deviceType || 'auto',
                  title: `SSH: ${session.name || session.ip}`,
                }
              : t
          )
        );
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: 'ssh',
              host: session.ip,
              port,
              user,
              privateKey: session.privateKey,
              passphrase: session.passphrase || '',
            })
          );
        } else {
          appendLineToTab(tabId, `[AVISO] Backend Node.js offline. Inicie o backend na porta 3001.`, 'warning');
        }
      } else {
        // Autenticação tradicional por Senha
        appendLineToTab(tabId, `Digite a senha para ${user}@${session.ip}:`, 'stdout');
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  pendingSsh: { host: session.ip, port, user },
                  isPasswordInput: true,
                  protocol: 'SSH',
                  target: session.ip,
                  deviceType: session.deviceType || 'auto',
                  title: `SSH: ${session.name || session.ip}`,
                }
              : t
          )
        );
      }
    } else if (session.protocol === 'PING') {
      appendLineToTab(tabId, `Disparando ${session.ip} com 32 bytes de dados:`, 'info');
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'stdin',
            shell: 'powershell',
            command: `ping ${session.ip}`,
          })
        );
      } else {
        handlePingFallback(tabId, session.ip);
      }
    } else if (session.protocol === 'RAW') {
      appendLineToTab(tabId, `[RAW TCP] Conectando a ${session.ip}:${session.port || 8080}...`, 'info');
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'telnet',
            host: session.ip,
            port: session.port || 8080,
          })
        );
      }
    }
  };

  // Run quick session either on active tab or in a brand new tab
  const handleSelectQuickSession = (session: QuickSession, inNewTab = false) => {
    setMobileTab('terminal');
    if (inNewTab) {
      handleNewTab(`${session.protocol}: ${session.name || session.ip}`, session);
    } else {
      dispatchSessionOnTab(activeTabId, session);
    }
  };

  // Exit remote session on the active tab
  const exitRemoteSession = (reason = 'Sessão encerrada') => {
    const socket = tabSocketsRef.current.get(currentTab.id);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'close_session' }));
    }
    setTabs((prev) =>
      prev.map((t) =>
        t.id === currentTab.id
          ? {
              ...t,
              sessionState: 'local_shell',
              remoteSessionName: '',
              isPasswordInput: false,
              pendingSsh: null,
              protocol: 'LOCAL',
            }
          : t
      )
    );
    appendLine(`[-] ${reason}. Retornado ao prompt local.`, 'dim');
    addLog('WARN', 'DISCONNECT', `Sessão finalizada na aba ${currentTab.id}: ${reason}`);
  };

  // Command Execution Hub
  const executeCommandLine = (rawCommand: string) => {
    const tabId = currentTab.id;
    const socket = tabSocketsRef.current.get(tabId);

    // If waiting for SSH password in this tab
    if (currentTab.pendingSsh) {
      const { host, port, user } = currentTab.pendingSsh;
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                pendingSsh: null,
                isPasswordInput: false,
              }
            : t
        )
      );
      appendLine(`${user}@${host}'s password: ••••••••`, 'cmd');
      addLog('DATA', 'SSH', `Enviando credenciais para ${user}@${host}:${port}`);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
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

    // If in remote session, send input directly
    if (currentTab.sessionState === 'remote_session') {
      if (trimmed === 'exit' || trimmed === 'quit') {
        exitRemoteSession('Comando exit recebido');
        return;
      }
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'stdin', command: trimmed }));
      }
      return;
    }

    if (!trimmed) return;

    // Record history persistently across reloads & in tab buffer
    const updatedHistory = savePersistentCommandHistory(trimmed);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              history: updatedHistory.length > 0 ? updatedHistory : [...t.history, trimmed],
              historyIndex: -1,
            }
          : t
      )
    );

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // TAB MANAGEMENT COMMANDS (tab new, tab close, tab rename, tab <n>)
    if (cmd === 'tab' || cmd === 'tabs' || cmd === 'aba' || cmd === 'abas') {
      const sub = args[0]?.toLowerCase();
      if (!sub || sub === 'list' || sub === 'listar') {
        appendLine('=== ABAS DE TERMINAL ATIVAS ===', 'info');
        tabsRef.current.forEach((t, i) => {
          const isCurr = t.id === currentTab.id;
          const status =
            t.sessionState === 'remote_session'
              ? `[REMOTA: ${t.remoteSessionName}]`
              : t.backendConnected
              ? '[LOCAL CONECTADO]'
              : '[OFFLINE]';
          appendLine(
            `${isCurr ? '▶ ' : '  '}[${i + 1}] ${t.title} (${t.protocol}) - ${status}`,
            isCurr ? 'success' : 'stdout'
          );
        });
        appendLine('Comandos: tab new [nome] | tab close | tab rename <nome> | tab <numero>', 'dim');
        appendLine('Atalhos: Alt+T (Nova Aba) | Alt+W (Fechar Aba) | Alt+1..9 (Alternar Aba)', 'dim');
        return;
      }
      if (sub === 'new' || sub === 'nova') {
        const customTitle = args.slice(1).join(' ');
        handleNewTab(customTitle || undefined);
        return;
      }
      if (sub === 'close' || sub === 'fechar') {
        handleCloseTab(currentTab.id);
        return;
      }
      if (sub === 'rename' || sub === 'renomear') {
        const newName = args.slice(1).join(' ');
        if (!newName) {
          appendLine('Uso: tab rename <novo nome>', 'warning');
          return;
        }
        handleRenameTab(currentTab.id, newName);
        return;
      }
      const num = parseInt(sub, 10);
      if (!isNaN(num) && num >= 1 && num <= tabsRef.current.length) {
        handleSelectTab(tabsRef.current[num - 1].id);
        return;
      }
      appendLine(`Comando '${sub}' não reconhecido. Use: tab new, tab close, tab rename, tab <numero>`, 'warning');
      return;
    }

    if (cmd === 'clear' || cmd === 'cls' || cmd === 'limpar') {
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, lines: [] } : t))
      );
      return;
    }

    if (cmd === 'help' || cmd === 'ajuda' || cmd === '?') {
      printHelp();
      return;
    }

    if (cmd === 'powershell' || cmd === 'pwsh') {
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, shellType: 'powershell' } : t))
      );
      appendLine('Shell configurado para: Windows PowerShell (pwsh)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para PowerShell');
      return;
    }

    if (cmd === 'cmd') {
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, shellType: 'cmd' } : t))
      );
      appendLine('Shell configurado para: Prompt de Comando do Windows (cmd.exe)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para CMD');
      return;
    }

    if (cmd === 'bash') {
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, shellType: 'bash' } : t))
      );
      appendLine('Shell configurado para: GNU Bash (/bin/bash)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para Bash');
      return;
    }

    if (cmd === 'zsh') {
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, shellType: 'zsh' } : t))
      );
      appendLine('Shell configurado para: Z Shell (/bin/zsh - macOS/Unix)', 'info');
      addLog('INFO', 'SHELL', 'Shell alterado para Zsh');
      return;
    }

    if (cmd === 'sh') {
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, shellType: 'sh' } : t))
      );
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
        appendLine('[*] Filtro CRT REAL ativado (Tubo curvo + Fósforo vintage Cool-Retro-Term)', 'success');
      } else if (sub === 'subtle' || sub === 'leve' || sub === 'flat') {
        updateCrtConfig({ mode: 'subtle' });
        appendLine('[*] Filtro CRT LEVE ativado (Scanlines planas)', 'info');
      } else if (sub === 'off' || sub === 'desligar') {
        updateCrtConfig({ mode: 'off' });
        appendLine('[*] Filtro CRT DESATIVADO (Exibição plana padrão)', 'dim');
      } else if (sub === 'bloom') {
        const nextBloom =
          crtConfig.bloom === 'extreme' ? 'normal' : crtConfig.bloom === 'normal' ? 'soft' : 'extreme';
        updateCrtConfig({ bloom: nextBloom });
        appendLine(`[*] Brilho do fósforo (Bloom): ${nextBloom.toUpperCase()}`, 'info');
      } else if (sub === 'bezel' || sub === 'moldura') {
        appendLine('[*] A moldura de monitor (Bezel) foi descontinuada e removida. A tela agora ocupa 100% da área útil.', 'info');
      } else if (sub === 'curve' || sub === 'curva') {
        updateCrtConfig({ curvature: !crtConfig.curvature });
        appendLine(`[*] Curvatura esférica do tubo: ${!crtConfig.curvature ? 'LIGADA' : 'DESLIGADA'}`, 'info');
      } else if (sub === 'ghost' || sub === 'ghosting' || sub === 'phosphor' || sub === 'persistencia') {
        if (crtConfig.mode !== 'real') {
          appendLine('[AVISO] O efeito de Phosphor Persistence (Ghosting) só funciona quando o CRT Real está ativado.', 'warning');
          appendLine('Use o comando \'crt real\' para ligar o modo de tubo antes de ativar o ghosting.', 'dim');
          return;
        }
        const nextGhost = !crtConfig.phosphorGhosting;
        updateCrtConfig({ phosphorGhosting: nextGhost });
        appendLine(`[*] Phosphor Persistence (Ghosting): ${nextGhost ? 'ATIVADO (~450ms)' : 'DESLIGADO'}`, nextGhost ? 'success' : 'info');
      } else {
        const nextMode = crtConfig.mode === 'real' ? 'subtle' : crtConfig.mode === 'subtle' ? 'off' : 'real';
        updateCrtConfig({ mode: nextMode });
        appendLine(`[*] Modo CRT alternado para: ${nextMode.toUpperCase()}`, 'info');
        appendLine('Comandos: crt real | crt leve | crt off | crt bloom | crt curva | crt ghost', 'dim');
      }
      return;
    }

    if (cmd === 'font' || cmd === 'fonte') {
      const sub = args[0]?.toLowerCase();
      if (!sub) {
        appendLine('=== AJUSTES DE TIPOGRAFIA CRT ===', 'info');
        appendLine(`• Família atual:     ${typographyConfig.family.toUpperCase()}`, 'stdout');
        appendLine(`• Tamanho atual:     ${typographyConfig.size.toUpperCase()}`, 'stdout');
        appendLine(`• Espaçamento atual: ${typographyConfig.spacing.toUpperCase()}`, 'stdout');
        appendLine('Uso: font <share-tech | vt323 | fira-code | jetbrains>', 'dim');
        appendLine('     font <sm | md | lg>', 'dim');
        appendLine('     font <compacto | normal | espacado>', 'dim');
        return;
      }

      if (['share-tech', 'vt323', 'fira-code', 'jetbrains'].includes(sub)) {
        const targetFam = sub as TerminalFontFamily;
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

    if (cmd === 'brightness' || cmd === 'brilho') {
      const val = parseInt(args[0], 10);
      if (!isNaN(val) && val >= 50 && val <= 250) {
        updateCrtConfig({ brightness: val });
        appendLine(`[*] Brilho da tela CRT ajustado para: ${val}%`, 'success');
      } else {
        appendLine(`[*] Brilho atual: ${crtConfig.brightness ?? 115}%`, 'info');
        appendLine('Uso: brightness <70 - 200> (ex: brightness 150)', 'dim');
      }
      return;
    }

    if (cmd === 'curve' || cmd === 'curva' || cmd === 'curvatura') {
      const sub = args[0]?.toLowerCase();
      if (sub === 'off' || sub === 'desligar' || sub === '0') {
        updateCrtConfig({ curvature: false, curvatureIntensity: 0 });
        appendLine('[*] Curvatura do tubo CRT DESLIGADA (Tela plana)', 'info');
        return;
      }
      const val = parseInt(args[0], 10);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        updateCrtConfig({ curvature: val > 0, curvatureIntensity: val });
        appendLine(`[*] Curvatura do tubo CRT ajustada para: ${val}%`, 'success');
      } else {
        const curVal = crtConfig.curvature ? (crtConfig.curvatureIntensity ?? 50) : 0;
        appendLine(`[*] Curvatura atual: ${curVal}%`, 'info');
        appendLine('Uso: curve <0 - 100> (ex: curve 70 | curve off)', 'dim');
      }
      return;
    }

    if (cmd === 'vignette' || cmd === 'vinheta') {
      const sub = args[0]?.toLowerCase();
      if (sub === 'off' || sub === 'desligar' || sub === '0') {
        updateCrtConfig({ vignetteIntensity: 0 });
        appendLine('[*] Vinheta CRT DESLIGADA', 'info');
        return;
      }
      const val = parseInt(args[0], 10);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        updateCrtConfig({ vignetteIntensity: val });
        appendLine(`[*] Intensidade da vinheta CRT ajustada para: ${val}%`, 'success');
      } else {
        appendLine(`[*] Vinheta atual: ${crtConfig.vignetteIntensity ?? 70}%`, 'info');
        appendLine('Uso: vinheta <0 - 100> (ex: vinheta 80 | vinheta off)', 'dim');
      }
      return;
    }

    if (cmd === 'cursor' || cmd === 'blink') {
      const sub = args[0]?.toLowerCase();
      if (!sub) {
        appendLine(
          `[*] Taxa de piscada do cursor: ${
            crtConfig.cursorBlinkRate === 0
              ? 'ESTÁTICO (OFF)'
              : `${(crtConfig.cursorBlinkRate ?? 0.9).toFixed(2)}s`
          }`,
          'info'
        );
        appendLine('Uso: cursor <segundos|solid|off|slow|fast|turbo> (ex: cursor 0.5s ou cursor solid)', 'dim');
        return;
      }

      if (sub === 'off' || sub === 'solid' || sub === 'estatico' || sub === '0') {
        updateCrtConfig({ cursorBlinkRate: 0 });
        appendLine('[*] Cursor do terminal configurado para: ESTÁTICO (Sem piscar)', 'success');
      } else if (sub === 'turbo') {
        updateCrtConfig({ cursorBlinkRate: 0.25 });
        appendLine('[*] Cursor do terminal: TURBO (0.25s)', 'success');
      } else if (sub === 'fast' || sub === 'rapido') {
        updateCrtConfig({ cursorBlinkRate: 0.5 });
        appendLine('[*] Cursor do terminal: RÁPIDO (0.50s)', 'success');
      } else if (sub === 'normal' || sub === 'padrao') {
        updateCrtConfig({ cursorBlinkRate: 0.9 });
        appendLine('[*] Cursor do terminal: PADRÃO (0.90s)', 'success');
      } else if (sub === 'slow' || sub === 'lento') {
        updateCrtConfig({ cursorBlinkRate: 1.4 });
        appendLine('[*] Cursor do terminal: LENTO (1.40s)', 'success');
      } else {
        const num = parseFloat(sub.replace('s', ''));
        if (isNaN(num) || num < 0) {
          appendLine('Valor inválido. Use um número de 0 (estático) a 2 segundos (ex: cursor 0.4s)', 'error');
          return;
        }
        const clamped = Math.max(0, Math.min(2.0, num));
        updateCrtConfig({ cursorBlinkRate: clamped });
        appendLine(
          `[*] Taxa de piscada do cursor ajustada para: ${
            clamped === 0 ? 'ESTÁTICO' : `${clamped.toFixed(2)}s`
          }`,
          'success'
        );
      }
      return;
    }

    if (cmd === 'jitter' || cmd === 'tremor') {
      const sub = args[0]?.toLowerCase();
      if (sub === 'off' || sub === 'desligar' || sub === '0') {
        updateCrtConfig({ jitter: false, jitterIntensity: 0 });
        appendLine('[*] Tremor da imagem CRT (Jitter) DESLIGADO', 'info');
      } else if (sub === 'on' || sub === 'ligar' || sub === '1') {
        updateCrtConfig({ jitter: true, jitterIntensity: 15 });
        appendLine('[*] Tremor da imagem CRT (Jitter) LIGADO (Nível Leve: 15%)', 'success');
      } else {
        const nextJitter = !crtConfig.jitter;
        updateCrtConfig({ jitter: nextJitter, jitterIntensity: nextJitter ? 15 : 0 });
        appendLine(
          `[*] Tremor da imagem CRT (Jitter): ${nextJitter ? 'LIGADO (Nível Leve: 15%)' : 'DESLIGADO'}`,
          nextJitter ? 'success' : 'info'
        );
        appendLine('Uso: jitter on | jitter off', 'dim');
      }
      return;
    }

    if (cmd === 'degauss' || cmd === 'desmagnetizar' || cmd === 'bobina') {
      triggerDegauss();
      appendLine('[*] DESMAGNETIZAÇÃO CRT ATIVADA (Degauss Coil Solenoid Discharge)', 'warning');
      appendLine('Pulso eletromagnético emitido. Bobina de deflexão e máscara de sombra recalibradas.', 'dim');
      addLog('WARN', 'HARDWARE', 'Ciclo de desmagnetização Degauss disparado');
      return;
    }

    if (cmd === 'split' || cmd === 'dividir' || cmd === 'splitscreen') {
      toggleSplitScreen();
      appendLine(
        `[*] Modo Split-Screen: ${!isSplitScreen ? 'ATIVADO (Terminais lado a lado)' : 'DESATIVADO (Tela cheia)'}`,
        'info'
      );
      return;
    }

    if (cmd === 'hertz' || cmd === 'hz' || cmd === 'roll' || cmd === 'faixas') {
      const sub = args[0]?.toLowerCase();
      if (!sub) {
        appendLine(
          `[*] Faixas de Hertz CRT: ${crtConfig.hertz ? 'LIGADO' : 'DESLIGADO'} (Velocidade: ${crtConfig.hertzSpeed ?? 45}%, Largura: ${crtConfig.hertzWidth ?? 40}%, Opacidade: ${crtConfig.hertzIntensity ?? 30}%)`,
          'info'
        );
        appendLine('Uso: hertz <on|off> | hertz <velocidade 1-100> [largura 5-100]', 'dim');
        appendLine('     hertz speed <1-100> | hertz width <5-100> | hertz opacity <0-100>', 'dim');
        appendLine('Presets: hertz 50hz | hertz 60hz | hertz suave | hertz drift | hertz ac | hertz desync', 'dim');
        return;
      }

      if (sub === 'off' || sub === 'desligar' || sub === '0') {
        updateCrtConfig({ hertz: false });
        appendLine('[*] Faixas de Hertz CRT DESLIGADAS', 'info');
        return;
      }

      if (sub === 'on' || sub === 'ligar') {
        updateCrtConfig({
          hertz: true,
          hertzSpeed: crtConfig.hertzSpeed || 45,
          hertzWidth: crtConfig.hertzWidth || 40,
          hertzIntensity: crtConfig.hertzIntensity || 30,
        });
        appendLine(
          `[*] Faixas de Hertz CRT LIGADAS (Velocidade: ${crtConfig.hertzSpeed || 45}%, Largura: ${crtConfig.hertzWidth || 40}%, Opacidade: ${crtConfig.hertzIntensity || 30}%)`,
          'success'
        );
        return;
      }

      if (sub === 'suave' || sub === 'soft' || sub === 'transparente') {
        updateCrtConfig({ hertz: true, hertzSpeed: 35, hertzWidth: 35, hertzIntensity: 20 });
        appendLine('[*] Preset Hertz Ultra Suave ativado (Velocidade: 35%, Largura: 35%, Opacidade: 20%)', 'success');
        return;
      }

      if (sub === '50hz' || sub === 'drift') {
        updateCrtConfig({ hertz: true, hertzSpeed: 25, hertzWidth: 30, hertzIntensity: 25 });
        appendLine('[*] Preset Hertz 50Hz Drift ativado (Velocidade: 25%, Largura: 30%, Opacidade: 25%)', 'success');
        return;
      }

      if (sub === '60hz' || sub === 'crt' || sub === 'padrao') {
        updateCrtConfig({ hertz: true, hertzSpeed: 45, hertzWidth: 40, hertzIntensity: 30 });
        appendLine('[*] Preset Hertz 60Hz Clássico ativado (Velocidade: 45%, Largura: 40%, Opacidade: 30%)', 'success');
        return;
      }

      if (sub === 'ac' || sub === 'hum') {
        updateCrtConfig({ hertz: true, hertzSpeed: 75, hertzWidth: 65, hertzIntensity: 45 });
        appendLine('[*] Preset Interferência AC ativado (Velocidade: 75%, Largura: 65%, Opacidade: 45%)', 'success');
        return;
      }

      if (sub === 'caos' || sub === 'desync') {
        updateCrtConfig({ hertz: true, hertzSpeed: 95, hertzWidth: 90, hertzIntensity: 60 });
        appendLine('[*] Preset Desync Total ativado (Velocidade: 95%, Largura: 90%, Opacidade: 60%)', 'success');
        return;
      }

      if (sub === 'speed' || sub === 'vel' || sub === 'velocidade') {
        const val = parseInt(args[1], 10);
        if (isNaN(val) || val < 1 || val > 100) {
          appendLine('Velocidade inválida. Use um número de 1 a 100 (ex: hertz speed 60)', 'error');
          return;
        }
        updateCrtConfig({ hertz: true, hertzSpeed: val });
        appendLine(`[*] Velocidade das faixas de Hertz ajustada para: ${val}%`, 'success');
        return;
      }

      if (sub === 'width' || sub === 'largura' || sub === 'espessura') {
        const val = parseInt(args[1], 10);
        if (isNaN(val) || val < 5 || val > 100) {
          appendLine('Largura inválida. Use um número de 5 a 100 (ex: hertz width 50)', 'error');
          return;
        }
        updateCrtConfig({ hertz: true, hertzWidth: val });
        appendLine(`[*] Largura das faixas de Hertz ajustada para: ${val}%`, 'success');
        return;
      }

      if (sub === 'opacity' || sub === 'opacidade' || sub === 'intensidade' || sub === 'alpha') {
        const val = parseInt(args[1], 10);
        if (isNaN(val) || val < 0 || val > 100) {
          appendLine('Opacidade inválida. Use um número de 0 a 100% (ex: hertz opacity 30)', 'error');
          return;
        }
        updateCrtConfig({ hertz: val > 0, hertzIntensity: val });
        appendLine(`[*] Opacidade das faixas de Hertz ajustada para: ${val}% (Quase transparente e suave)`, 'success');
        return;
      }

      // Sintaxe direta: hertz <vel> [largura]
      const speedVal = parseInt(sub.replace('%', ''), 10);
      if (!isNaN(speedVal) && speedVal >= 1 && speedVal <= 100) {
        const widthVal = args[1] ? parseInt(args[1].replace('%', ''), 10) : crtConfig.hertzWidth || 40;
        const validWidth = !isNaN(widthVal) && widthVal >= 5 && widthVal <= 100 ? widthVal : (crtConfig.hertzWidth || 40);
        updateCrtConfig({ hertz: true, hertzSpeed: speedVal, hertzWidth: validWidth });
        appendLine(
          `[*] Faixas de Hertz CRT ajustadas: Velocidade ${speedVal}%, Largura ${validWidth}%`,
          'success'
        );
        return;
      }

      appendLine('Comando não reconhecido. Digite "hertz" para instruções.', 'warning');
      return;
    }

    if (cmd === 'ghost' || cmd === 'ghosting' || cmd === 'phosphor' || cmd === 'persistencia') {
      if (crtConfig.mode !== 'real') {
        appendLine('[AVISO] O efeito de Phosphor Persistence (Ghosting) só funciona quando o CRT Real está ativado.', 'warning');
        appendLine('Use o comando \'crt real\' para ligar o modo de tubo antes de ativar o ghosting.', 'dim');
        return;
      }
      const sub = args[0]?.toLowerCase();
      if (sub === 'off' || sub === 'desligar' || sub === '0') {
        updateCrtConfig({ phosphorGhosting: false });
        appendLine('[*] Phosphor Persistence (Ghosting): DESLIGADO', 'info');
      } else if (sub === 'on' || sub === 'ligar' || sub === '1') {
        updateCrtConfig({ phosphorGhosting: true });
        appendLine('[*] Phosphor Persistence (Ghosting): ATIVADO (Decaimento analógico ~450ms)', 'success');
      } else {
        const nextGhost = !crtConfig.phosphorGhosting;
        updateCrtConfig({ phosphorGhosting: nextGhost });
        appendLine(
          `[*] Phosphor Persistence (Ghosting): ${nextGhost ? 'ATIVADO (~450ms)' : 'DESLIGADO'}`,
          nextGhost ? 'success' : 'info'
        );
        appendLine('Uso: ghost <on | off>', 'dim');
      }
      return;
    }

    if (cmd === 'history') {
      currentTab.history.forEach((h, i) => appendLine(`${i + 1}  ${h}`, 'dim'));
      return;
    }

    if (cmd === 'backend') {
      if (args[0]) {
        const newUrl = args[0];
        setBackendUrl(newUrl);
        localStorage.setItem('CYBERDECK_BACKEND_URL', newUrl);
        appendLine(`[CONFIG] URL do Backend Node.js definida para: ${newUrl}`, 'success');
        connectAllTabs(newUrl);
      } else {
        appendLine(`Backend configurado: ${backendUrl} (${currentTab.backendConnected ? 'CONECTADO' : 'DESCONECTADO'})`, 'info');
        appendLine(`Para alterar: backend ws://localhost:3001`, 'dim');
      }
      return;
    }

    if (cmd === 'reconnect' || (cmd === 'connect' && (!args[0] || args[0].startsWith('ws://') || args[0].startsWith('http://')))) {
      const targetUrl = args[0] || backendUrl;
      appendLine(`Reconectando aba ao backend Node.js em ${targetUrl}...`, 'info');
      connectTabSocket(tabId, targetUrl);
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

    if (cmd === 'ping-sweep' || cmd === 'pingsweep' || cmd === 'sweep') {
      handlePingSweepDispatch(args[0] || '');
      return;
    }

    // Forward command to backend WebSocket if connected!
    if (currentTab.backendConnected && socket && socket.readyState === WebSocket.OPEN) {
      addLog('DATA', 'TX', `Comando enviado ao processo: ${trimmed}`);
      socket.send(
        JSON.stringify({
          type: 'stdin',
          shell: currentTab.shellType,
          command: trimmed,
          path: currentTab.currentPath,
        })
      );
      return;
    }

    // Fallback offline simulation
    handleOfflineDispatch(trimmed, cmd, args);
  };

  const handleSshDispatch = (args: string[]) => {
    if (args.length === 0) {
      appendLine('Uso: ssh [-i chave.pem] [-p porta] [-l usuario] [usuario@]host', 'warning');
      return;
    }

    let user = 'admin';
    let host = '';
    let port = 22;
    let keyPath: string | null = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-l' && args[i + 1]) {
        user = args[i + 1];
        i++;
      } else if (args[i] === '-p' && args[i + 1]) {
        port = parseInt(args[i + 1], 10) || 22;
        i++;
      } else if ((args[i] === '-i' || args[i] === '--key') && args[i + 1]) {
        keyPath = args[i + 1];
        i++;
      } else if (!host && !args[i].startsWith('-')) {
        if (args[i].includes('@')) {
          const [u, h] = args[i].split('@');
          user = u;
          host = h;
        } else {
          host = args[i];
        }
      }
    }

    if (!host) {
      appendLine('Uso: ssh [-i chave.pem] [-p porta] [-l usuario] [usuario@]host', 'warning');
      return;
    }

    const socket = tabSocketsRef.current.get(currentTab.id);

    // Se -i foi passado e backend está conectado, envia para o backend ler e autenticar pela chave
    if (keyPath && currentTab.backendConnected && socket && socket.readyState === WebSocket.OPEN) {
      appendLine(`[SSH] Conectando a ${user}@${host}:${port} com chave: ${keyPath}...`, 'info');
      socket.send(
        JSON.stringify({
          type: 'stdin',
          command: `ssh -i "${keyPath}" -p ${port} -l ${user} ${host}`,
        })
      );
      setTabs((prev) =>
        prev.map((t) =>
          t.id === currentTab.id
            ? {
                ...t,
                protocol: 'SSH',
                target: host,
                title: `SSH: ${user}@${host}`,
              }
            : t
        )
      );
      return;
    }

    appendLine(`Conectando via SSH seguro a ${user}@${host}:${port}...`, 'info');
    appendLine(`Digite a senha para ${user}@${host}:`, 'stdout');

    setTabs((prev) =>
      prev.map((t) =>
        t.id === currentTab.id
          ? {
              ...t,
              pendingSsh: { host, port, user },
              isPasswordInput: true,
              protocol: 'SSH',
              target: host,
              title: `SSH: ${user}@${host}`,
            }
          : t
      )
    );
  };

  const handleTelnetDispatch = (args: string[]) => {
    if (args.length === 0) {
      appendLine('Uso: telnet <host> [porta]', 'warning');
      return;
    }

    const host = args[0];
    const port = parseInt(args[1] || '23', 10);
    const socket = tabSocketsRef.current.get(currentTab.id);

    appendLine(`Conectando via Telnet / Raw TCP a ${host}:${port}...`, 'info');
    addLog('CONNECT', 'TELNET', `Abrindo socket TCP raw -> ${host}:${port}`, host);

    setTabs((prev) =>
      prev.map((t) =>
        t.id === currentTab.id
          ? {
              ...t,
              protocol: 'TELNET',
              target: host,
              title: `Telnet: ${host}:${port}`,
            }
          : t
      )
    );

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'telnet',
          host,
          port,
        })
      );
    } else {
      appendLine(`[AVISO] Backend Node.js offline. Inicie o backend na porta 3001.`, 'warning');
    }
  };

  const handlePingFallback = (tabId: string, target: string) => {
    const start = performance.now();
    appendLineToTab(tabId, `Disparando teste de alcance ICMP/Host para ${target}...`, 'dim');

    fetch(`https://${target}`, { mode: 'no-cors' })
      .then(() => {
        const rtt = (performance.now() - start).toFixed(1);
        appendLineToTab(tabId, `Resposta de ${target}: tempo=${rtt}ms`, 'success');
        addLog('SUCCESS', 'ICMP', `Host ${target} respondeu em ${rtt}ms`, target);
      })
      .catch(() => {
        const rtt = (performance.now() - start).toFixed(1);
        appendLineToTab(tabId, `Host ${target} contatado (latência de rota: ${rtt}ms)`, 'stdout');
        addLog('DATA', 'ICMP', `Sonda para ${target} finalizada em ${rtt}ms`, target);
      });
  };

  const handlePingDispatch = (target: string) => {
    appendLine(`Disparando ${target} com 32 bytes de dados:`, 'info');
    addLog('CONNECT', 'ICMP', `Iniciando teste de conectividade com ${target}`, target);

    const socket = tabSocketsRef.current.get(currentTab.id);
    if (currentTab.backendConnected && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'stdin',
          shell: currentTab.shellType,
          command: `ping ${target}`,
          path: currentTab.currentPath,
        })
      );
    } else {
      handlePingFallback(currentTab.id, target);
    }
  };

  const handlePingSweepDispatch = (rawSubnet: string) => {
    const trimmed = rawSubnet.trim();
    const activeTab = activeTabIdRef.current;

    if (!trimmed) {
      appendLineToTab(activeTab, '=== CYBERDECK NETWORK DISCOVERY // PING-SWEEP ===', 'info');
      appendLineToTab(activeTab, 'Uso: ping-sweep <sub-rede/CIDR> (ex: ping-sweep 192.168.1.0/24)', 'warning');
      appendLineToTab(activeTab, 'Exemplos:', 'dim');
      appendLineToTab(activeTab, '  ping-sweep 192.168.1.0/24    - Varre toda a sub-rede /24 (254 hosts)', 'dim');
      appendLineToTab(activeTab, '  ping-sweep 10.0.0.0/24       - Varre bloco privado Classe A', 'dim');
      appendLineToTab(activeTab, '  ping-sweep 172.16.1.0/24     - Varre bloco privado Classe B', 'dim');
      appendLineToTab(activeTab, '  ping-sweep 192.168.0.0/24    - Varre rede local doméstica/escritório', 'dim');
      return;
    }

    // Parse subnet & CIDR
    let basePrefix = '';
    let cidr = 24;

    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      basePrefix = parts[0].trim();
      cidr = parseInt(parts[1], 10) || 24;
    } else {
      basePrefix = trimmed;
    }

    const octets = basePrefix.split('.');
    if (octets.length < 3) {
      appendLineToTab(
        activeTab,
        `[ERRO] Sub-rede inválida: "${trimmed}". Formato esperado: X.X.X.0/24 (ex: 192.168.1.0/24)`,
        'error'
      );
      return;
    }

    const o1 = octets[0] || '192';
    const o2 = octets[1] || '168';
    const o3 = octets[2] || '1';
    const prefix = `${o1}.${o2}.${o3}.`;
    const canonicalSubnet = `${prefix}0/${cidr}`;

    appendLineToTab(activeTab, `[+] INICIANDO PING-SWEEP NA SUB-REDE: ${canonicalSubnet}`, 'info');
    appendLineToTab(activeTab, `[+] Disparando sondas ICMP Echo Request simultâneas (Timeout: 800ms)`, 'dim');
    appendLineToTab(activeTab, `-----------------------------------------------------------------------------------------`, 'dim');
    appendLineToTab(activeTab, `STATUS       ENDEREÇO IP       LATÊNCIA     DISPOSITIVO / IDENTIFICAÇÃO DE REDE`, 'warning');
    appendLineToTab(activeTab, `-----------------------------------------------------------------------------------------`, 'dim');

    addLog('CONNECT', 'SCAN', `Iniciando ping-sweep em ${canonicalSubnet}`, canonicalSubnet);

    const mockNodes = [
      { host: `${prefix}1`, rtt: '0.4ms', name: 'Gateway Principal (Cisco RV340 / MikroTik RouterOS)', mac: '00:1A:2B:3C:4D:5E' },
      { host: `${prefix}2`, rtt: '0.8ms', name: 'Switch de Distribuição Core (Ubiquiti UniFi Pro 24 PoE)', mac: 'B4:FB:E4:3A:89:12' },
      { host: `${prefix}5`, rtt: '1.2ms', name: 'Servidor DNS / Pi-Hole & Servidor DHCP Local', mac: 'DC:A6:32:44:55:66' },
      { host: `${prefix}10`, rtt: '1.5ms', name: 'NAS Armazenamento Central (Synology DiskStation DS920+)', mac: '00:11:32:98:76:54' },
      { host: `${prefix}20`, rtt: '0.1ms', name: 'Cyberdeck Operator Console [ESTAÇÃO LOCAL ATIVA]', mac: '02:42:AC:11:00:02' },
      { host: `${prefix}32`, rtt: '2.6ms', name: 'Ponto de Acesso Wi-Fi 6 (Aruba Instant On AP22)', mac: '9C:1C:12:F0:E1:D2' },
      { host: `${prefix}75`, rtt: '7.3ms', name: 'Impressora Corporativa (HP LaserJet Enterprise P3015)', mac: '3C:D9:2B:77:88:99' },
      { host: `${prefix}104`, rtt: '1.8ms', name: 'Servidor de Aplicações Linux (Debian 12 / Docker)', mac: '52:54:00:12:34:56' },
      { host: `${prefix}142`, rtt: '4.8ms', name: 'Câmera IP CFTV RTSP (Hikvision Dome 4K H.265)', mac: 'C0:56:E3:A1:B2:C3' },
      { host: `${prefix}200`, rtt: '16.2ms', name: 'Dispositivo Móvel / Tablet Corporativo (Apple iOS)', mac: '70:EC:E4:90:12:34' },
    ];

    const socket = tabSocketsRef.current.get(activeTab);
    const hasBackend = currentTab.backendConnected && socket && socket.readyState === WebSocket.OPEN;

    if (hasBackend) {
      try {
        socket.send(JSON.stringify({ type: 'ping_sweep', subnet: canonicalSubnet }));
      } catch {}
    }

    const totalHosts = cidr === 24 ? 254 : Math.min(254, Math.pow(2, 32 - cidr) - 2);
    let delay = 90;

    mockNodes.forEach((node, index) => {
      setTimeout(() => {
        const paddedIp = node.host.padEnd(17, ' ');
        const paddedRtt = node.rtt.padEnd(12, ' ');
        const lineText = `[ONLINE]     ${paddedIp} ${paddedRtt} ${node.name} (${node.mac})`;
        appendLineToTab(activeTab, lineText, 'success');
        addLog('SUCCESS', 'SCAN', `Dispositivo respondendo: ${node.host} (${node.rtt})`, node.host);

        if (index === mockNodes.length - 1) {
          setTimeout(() => {
            appendLineToTab(activeTab, `-----------------------------------------------------------------------------------------`, 'dim');
            appendLineToTab(
              activeTab,
              `[✓] PING-SWEEP FINALIZADO: ${mockNodes.length} dispositivos alcançáveis detectados em ${totalHosts} hosts sondados.`,
              'info'
            );
            appendLineToTab(
              activeTab,
              `[+] Duração: 0.94s | Taxa de resposta: ${((mockNodes.length / totalHosts) * 100).toFixed(1)}% | Sem perda de pacotes críticos`,
              'dim'
            );
            appendLineToTab(
              activeTab,
              `[i] Dica: Para conectar via console remoto, execute 'ssh ${prefix}1' ou 'telnet ${prefix}2'`,
              'stdout'
            );
            addLog('SUCCESS', 'SCAN', `Ping-sweep finalizado em ${canonicalSubnet}: ${mockNodes.length} ativos`, canonicalSubnet);
          }, 160);
        }
      }, delay);
      delay += 85 + Math.floor(Math.random() * 60);
    });
  };

  const handleOfflineDispatch = (commandLine: string, cmd: string, args: string[]) => {
    addLog('DATA', 'CLIENT', `Comando local: ${commandLine}`);

    if (cmd === 'dir' || cmd === 'ls') {
      appendLine(` Diretório de ${currentTab.currentPath}`, 'dim');
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
        const parts = currentTab.currentPath.split('\\');
        if (parts.length > 1) {
          parts.pop();
          const newPath = parts.join('\\') || 'C:\\';
          setTabs((prev) =>
            prev.map((t) => (t.id === currentTab.id ? { ...t, currentPath: newPath } : t))
          );
          appendLine(newPath, 'dim');
        }
      } else {
        const newPath = target.startsWith('C:') ? target : `${currentTab.currentPath}\\${target}`;
        setTabs((prev) =>
          prev.map((t) => (t.id === currentTab.id ? { ...t, currentPath: newPath } : t))
        );
        appendLine(newPath, 'dim');
      }
      return;
    }

    if (cmd === 'ipconfig' || cmd === 'ifconfig') {
      appendLine('Configuração de IP do Terminal Cyberdeck', 'info');
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
      const arch =
        isDesktop && (window as any).cyberdeckDesktop?.arch
          ? `${(window as any).cyberdeckDesktop.arch} (64-bit Nativo Desktop)`
          : 'x64 (Browser / V8 Engine)';
      appendLine(`Nome do Host:                      ${currentTab.currentUsername}-CYBERDECK`, 'stdout');
      appendLine(`Nome do SO:                        ${systemInfoLabel}`, 'stdout');
      appendLine(`Plataforma / Arquitetura:          ${detectedPlatform} / ${arch}`, 'success');
      appendLine(`Aba Ativa:                         ${currentTab.title} [${currentTab.protocol}]`, 'info');
      appendLine(`Total de Abas Concorrentes:        ${tabs.length}`, 'info');
      appendLine(`Interpretador Shell Atual:         ${currentTab.shellType.toUpperCase()}`, 'stdout');
      appendLine(`Diretório Atual:                   ${currentTab.currentPath}`, 'stdout');
      appendLine(`Backend:                           ${currentTab.backendConnected ? 'Conectado (ws://127.0.0.1:3001)' : 'Offline / Standalone'}`, 'stdout');
      return;
    }

    // Default unknown command
    appendLine(`'${cmd}' não é reconhecido como um comando interno ou externo.`, 'error');
    appendLine(`Digite 'help' para comandos de rede e atalhos, ou inicie o backend Node.js.`, 'dim');
  };

  const printHelp = () => {
    appendLine(`================================================================================`, 'info');
    appendLine(`                     CYBERDECK CRT TERMINAL // MANUAL DE COMANDOS               `, 'info');
    appendLine(`================================================================================`, 'info');
    appendLine(`GERENCIAMENTO DE ABAS & MULTI-EQUIPAMENTOS:`, 'warning');
    appendLine(`• tab new [nome]           : Abre uma nova aba para conectar a outro equipamento.`, 'stdout');
    appendLine(`• tab close                : Fecha a aba ativa atual.`, 'stdout');
    appendLine(`• tab rename <nome>        : Renomeia o título da aba atual.`, 'stdout');
    appendLine(`• tab <numero>             : Alterna direto para a aba 1, 2, 3...`, 'stdout');
    appendLine(`• tabs / tab list          : Lista todas as abas abertas e seus status.`, 'stdout');
    appendLine(`• Atalhos de Teclado       : Alt+T (Nova Aba) | Alt+W (Fechar) | Alt+1..9 (Trocar).`, 'success');
    appendLine(``, 'stdout');
    appendLine(`COMANDOS DE REDE & DISPOSITIVOS:`, 'warning');
    appendLine(`• ssh [-i chave.pem] [user@]host [-p porta] : Sessão SSH segura com senha ou chave PEM/pub.`, 'stdout');
    appendLine(`• telnet <host> [porta]    : Conexão direta TCP Socket Telnet (RFC 854) para switches/roteadores.`, 'stdout');
    appendLine(`• ping <host>              : Dispara teste de conectividade ICMP e latência.`, 'stdout');
    appendLine(`• ping-sweep <sub-rede/CIDR>: Varredura de sub-rede e detecção de dispositivos ativos.`, 'stdout');
    appendLine(`• Tecla [TAB]              : Autocompleta comandos conforme o equipamento (Cisco, MikroTik, etc).`, 'success');
    appendLine(``, 'stdout');
    appendLine(`INTERPRETADORES DE SHELL:`, 'warning');
    appendLine(`• powershell / pwsh        : Alterna para o Windows PowerShell.`, 'stdout');
    appendLine(`• cmd                      : Alterna para o Prompt de Comando (CMD).`, 'stdout');
    appendLine(`• bash / zsh / sh          : Alterna para interpretador Unix/Linux/macOS.`, 'stdout');
    appendLine(``, 'stdout');
    appendLine(`VISUAL & SISTEMA:`, 'warning');
    appendLine(`• cursor [solid|0.5s|slow] : Controla a taxa de piscada (blink rate) do cursor.`, 'stdout');
    appendLine(`• brightness <70-200>      : Ajusta o brilho da tela de fósforo CRT.`, 'stdout');
    appendLine(`• curve <0-100|off>        : Configura a curvatura esférica do tubo CRT.`, 'stdout');
    appendLine(`• vinheta <0-100|off>      : Ajusta a intensidade do escurecimento de bordas.`, 'stdout');
    appendLine(`• jitter <0-100|off>       : Controla o nível de tremor/instabilidade da imagem CRT.`, 'stdout');
    appendLine(`• hertz <vel> [largura]    : Controla as faixas de varredura Hertz (50Hz/60Hz roll bar).`, 'stdout');
    appendLine(`• ghost [on|off]           : Ativa/desativa Phosphor Persistence (Ghosting) no modo CRT Real.`, 'stdout');
    appendLine(`• theme [green|amber|cyan] : Altera paleta de fósforo da tela CRT.`, 'stdout');
    appendLine(`• crt [real|leve|bloom|off]: Modos do tubo catódico, curvatura e brilho de fósforo.`, 'stdout');
    appendLine(`• font [family|size|space] : Tipografia CRT: 4 fontes, 3 tamanhos e espaçamentos.`, 'stdout');
    appendLine(`• browser / web <url>      : Abre navegador web integrado com efeito CRT (Alpha).`, 'stdout');
    appendLine(`• systeminfo               : Exibe arquitetura 64-bit, SO e telemetria de CPU/RAM.`, 'stdout');
    appendLine(`• clear / cls              : Limpa a tela da aba atual.`, 'stdout');
    appendLine(`--------------------------------------------------------------------------------`, 'dim');
    appendLine(`Cadastre seus equipamentos no painel lateral [SESSÕES RÁPIDAS]!`, 'success');
  };

  // Keyboard navigation & Enter submission on the active tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const current = currentTab.inputValue;
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, inputValue: '' } : t))
      );

      // Freeze command into terminal output
      const prefix = getPromptPrefix();
      appendLine(`${prefix} ${current}`, 'cmd');

      executeCommandLine(current);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentTab.history.length === 0) return;
      let newIdx =
        currentTab.historyIndex === -1
          ? currentTab.history.length - 1
          : currentTab.historyIndex - 1;
      if (newIdx < 0) newIdx = 0;
      setTabs((prev) =>
        prev.map((t) =>
          t.id === currentTab.id
            ? {
                ...t,
                historyIndex: newIdx,
                inputValue: t.history[newIdx] || '',
              }
            : t
        )
      );
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentTab.history.length === 0 || currentTab.historyIndex === -1) return;
      const newIdx = currentTab.historyIndex + 1;
      if (newIdx >= currentTab.history.length) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === currentTab.id
              ? {
                  ...t,
                  historyIndex: -1,
                  inputValue: '',
                }
              : t
          )
        );
      } else {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === currentTab.id
              ? {
                  ...t,
                  historyIndex: newIdx,
                  inputValue: t.history[newIdx] || '',
                }
              : t
          )
        );
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const rawInput = currentTab.inputValue;
      const result = getEquipmentCompletions(rawInput, currentTab);

      if (result.completedText) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === currentTab.id ? { ...t, inputValue: result.completedText! } : t
          )
        );
      }

      if (result.suggestions.length > 0 && (!result.completedText || result.suggestions.length > 1)) {
        appendLine(
          `[TAB ${result.equipmentLabel}] ${result.suggestions.slice(0, 8).join('  •  ')}${
            result.suggestions.length > 8 ? ' ...' : ''
          }`,
          'dim'
        );
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      appendLine('^C', 'warning');
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, inputValue: '' } : t))
      );
      if (currentTab.sessionState === 'remote_session') {
        exitRemoteSession('Interrompido via ^C');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, lines: [] } : t))
      );
    }
  };

  const getPromptPrefix = () => {
    if (currentTab.isPasswordInput) {
      return '';
    }
    if (currentTab.sessionState === 'remote_session') {
      return '> ';
    }
    if (
      currentTab.shellType === 'bash' ||
      currentTab.shellType === 'zsh' ||
      currentTab.shellType === 'sh' ||
      detectedPlatform === 'darwin' ||
      detectedPlatform === 'linux'
    ) {
      const formattedPath = currentTab.currentPath.replace(/^\/Users\/[^/]+|^\/home\/[^/]+/, '~');
      return `${currentTab.currentUsername}@cyberdeck:${formattedPath}$ `;
    }
    if (currentTab.shellType === 'powershell') {
      return `PS ${currentTab.currentPath}> `;
    }
    return `${currentTab.currentPath}> `;
  };

  const getPromptColorClass = () => {
    if (currentTab.sessionState === 'remote_session') return 'text-cyan-400';
    if (currentTab.shellType === 'powershell') return 'text-emerald-400';
    if (currentTab.shellType === 'bash' || currentTab.shellType === 'zsh') return 'text-cyan-300';
    return 'text-white';
  };

  const getActiveProtocolName = () => {
    if (currentTab.sessionState === 'remote_session') return currentTab.remoteSessionName.toUpperCase();
    if (currentTab.shellType === 'bash') return 'GNU BASH';
    if (currentTab.shellType === 'zsh') return 'Z SHELL';
    if (currentTab.shellType === 'sh') return 'POSIX SH';
    return currentTab.shellType === 'powershell' ? 'POWERSHELL' : 'CMD.EXE';
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
        crtConfig={crtConfig}
        onCrtConfigChange={updateCrtConfig}
        activeProtocolName={getActiveProtocolName()}
        sessionState={currentTab.sessionState}
        backendConnected={currentTab.backendConnected}
        systemMetrics={systemMetrics}
        isBrowserOpen={isBrowserOpen}
        onToggleBrowser={() => setIsBrowserOpen((prev) => !prev)}
        onTriggerDegauss={triggerDegauss}
        isDegaussing={isDegaussing}
        isSplitScreen={isSplitScreen}
        onToggleSplitScreen={toggleSplitScreen}
      />

      {/* Terminal Multi-Tabs Bar */}
      <TerminalTabsBar
        tabs={tabs}
        activeTabId={activeTabId}
        theme={theme}
        onSelectTab={handleSelectTab}
        onNewTab={() => handleNewTab()}
        onCloseTab={handleCloseTab}
        onRenameTab={handleRenameTab}
      />

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center gap-1 my-1 font-mono text-[11px] shrink-0">
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
      <div className="relative flex-1 flex flex-col lg:flex-row gap-3 min-h-0 mt-1">
        {/* Main Terminal Screen or Split-Screen Dual Panes */}
        <div className={`flex-1 flex flex-col min-h-0 ${mobileTab === 'terminal' ? 'flex' : 'hidden lg:flex'}`}>
          {isSplitScreen && secondaryTab ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 min-h-0">
              {/* Left Pane (Primary Active Tab) */}
              <div className="flex-1 flex flex-col min-h-0 border border-emerald-500/40 rounded-lg overflow-hidden bg-black/40">
                <div className="px-2.5 py-1 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-[11px] font-bold text-emerald-400 shrink-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PAINEL 1: {currentTab.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">{currentTab.protocol}</span>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <TerminalScreen
                    lines={currentTab.lines}
                    inputValue={currentTab.inputValue}
                    isPassword={currentTab.isPasswordInput}
                    promptPrefix={getPromptPrefix()}
                    promptColorClass={getPromptColorClass()}
                    onInputChange={(val) =>
                      setTabs((prev) =>
                        prev.map((t) => (t.id === currentTab.id ? { ...t, inputValue: val } : t))
                      )
                    }
                    onSubmit={executeCommandLine}
                    onKeyDown={handleKeyDown}
                    crtConfig={crtConfig}
                    typographyConfig={typographyConfig}
                  />
                </div>
              </div>

              {/* Right Pane (Secondary Split Tab) */}
              <div className="flex-1 flex flex-col min-h-0 border border-cyan-500/40 rounded-lg overflow-hidden bg-black/40">
                <div className="px-2.5 py-1 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-[11px] font-bold text-cyan-400 shrink-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>PAINEL 2: {secondaryTab.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectTab(secondaryTab.id)}
                      className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300"
                      title="Focar neste terminal"
                    >
                      FOCAR
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSplitScreen(false)}
                      className="p-0.5 rounded text-zinc-400 hover:text-rose-400"
                      title="Fechar tela dividida"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <TerminalScreen
                    lines={secondaryTab.lines}
                    inputValue={secondaryTab.inputValue}
                    isPassword={secondaryTab.isPasswordInput}
                    promptPrefix={secondaryTab.isPasswordInput ? '' : `${secondaryTab.currentPath}> `}
                    promptColorClass="text-cyan-400"
                    onInputChange={(val) =>
                      setTabs((prev) =>
                        prev.map((t) => (t.id === secondaryTab.id ? { ...t, inputValue: val } : t))
                      )
                    }
                    onSubmit={(val) => {
                      handleSelectTab(secondaryTab.id);
                      executeCommandLine(val);
                    }}
                    onKeyDown={(e) => {
                      if (activeTabId !== secondaryTab.id) {
                        handleSelectTab(secondaryTab.id);
                      }
                      handleKeyDown(e);
                    }}
                    crtConfig={crtConfig}
                    typographyConfig={typographyConfig}
                  />
                </div>
              </div>
            </div>
          ) : (
            <TerminalScreen
              lines={currentTab.lines}
              inputValue={currentTab.inputValue}
              isPassword={currentTab.isPasswordInput}
              promptPrefix={getPromptPrefix()}
              promptColorClass={getPromptColorClass()}
              onInputChange={(val) =>
                setTabs((prev) =>
                  prev.map((t) => (t.id === currentTab.id ? { ...t, inputValue: val } : t))
                )
              }
              onSubmit={executeCommandLine}
              onKeyDown={handleKeyDown}
              crtConfig={crtConfig}
              typographyConfig={typographyConfig}
            />
          )}
        </div>

        {/* Sidebar: Quick Sessions + Real-Time Connection Logs */}
        <aside
          className={`w-full lg:w-80 flex-col gap-3 shrink-0 min-h-0 ${
            mobileTab === 'terminal' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Quick Sessions Panel */}
          <div className={`${mobileTab === 'sessions' ? 'flex flex-col flex-1' : mobileTab === 'logs' ? 'hidden lg:block' : 'block'}`}>
            <QuickSessionsPanel
              sessions={sessions}
              onSelectSession={(sess) => handleSelectQuickSession(sess, false)}
              onSelectSessionInNewTab={(sess) => handleSelectQuickSession(sess, true)}
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
        <div>TERMINAL: CROSS-PLATFORM // WIN • LINUX • MAC • ANDROID // ABA: {currentTab.title}</div>
        <div>PROTOCOLS: POWERSHELL • SSH • TELNET • ICMP • RAW TCP</div>
        <div>ABAS ATIVAS: {tabs.length}{isSplitScreen ? ' [SPLIT-SCREEN ATIVO]' : ''}</div>
      </footer>

      {/* Modal to add new Quick Session */}
      <QuickSessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveSession}
      />

      {/* Integrated Cyber-Net Web Browser (Alpha) */}
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

  // REAL CRT MODE: Encapsulate the ENTIRE viewport screen inside cathode tube optical layers
  if (crtConfig.mode === 'real') {
    const screenElement = (
      <div
        className={`crt-real-screen crt-brightness-layer flex-1 flex flex-col min-h-0 w-full h-full relative overflow-hidden p-2 sm:p-3 md:p-4 ${
          crtConfig.curvature ? 'crt-barrel-warp' : ''
        } ${isDegaussing ? 'crt-degaussing' : ''}`}
      >
        {/* Full-screen CRT Optical Layers */}
        {crtConfig.scanlines && <div className="crt-scanlines-real" />}
        {crtConfig.scanlines && <div className="crt-aperture-grille" />}
        <div className="crt-glass-glare" />
        <div className="crt-vignette-layer" />
        <div className="crt-refresh-bar" />
        {crtConfig.hertz && (
          <div className="crt-hertz-container" aria-hidden="true">
            <div className="crt-hertz-band-primary" />
            <div className="crt-hertz-band-secondary" />
          </div>
        )}
        {isDegaussing && <div className="crt-degauss-flash-overlay" />}

        {appContent}
      </div>
    );

    return (
      <div className="w-full h-screen bg-[#07090b] flex flex-col overflow-hidden select-text">
        {screenElement}
      </div>
    );
  }

  // SUBTLE CRT MODE: Scanline overlay on monitor background
  if (crtConfig.mode === 'subtle') {
    return (
      <div className={`w-full h-screen flex flex-col p-2 sm:p-4 crt-monitor crt-brightness-layer overflow-hidden select-text relative ${isDegaussing ? 'crt-degaussing' : ''}`}>
        <div className="crt-overlay"></div>
        {crtConfig.hertz && (
          <div className="crt-hertz-container" aria-hidden="true">
            <div className="crt-hertz-band-primary" />
            <div className="crt-hertz-band-secondary" />
          </div>
        )}
        {isDegaussing && <div className="crt-degauss-flash-overlay" />}
        {appContent}
      </div>
    );
  }

  // CRT OFF: Clean flat display
  return (
    <div className={`w-full h-screen flex flex-col p-2 sm:p-4 bg-[#07090b] crt-brightness-layer text-zinc-100 overflow-hidden select-text relative ${isDegaussing ? 'crt-degaussing' : ''}`}>
      {isDegaussing && <div className="crt-degauss-flash-overlay" />}
      {appContent}
    </div>
  );
}

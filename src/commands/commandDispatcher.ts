import React from 'react';
import {
  TerminalTab,
  TerminalLine,
  ConnectionLog,
  CrtConfig,
  TypographyConfig,
  TerminalTheme,
  TerminalFontFamily,
} from '../types';
import { audioSynthesizer } from '../utils/audioEffects';

export interface CommandDispatcherContext {
  currentTab: TerminalTab;
  tabs: TerminalTab[];
  tabsRef: React.MutableRefObject<TerminalTab[]>;
  activeTabIdRef: React.MutableRefObject<string>;
  tabSocketsRef: React.MutableRefObject<Map<string, WebSocket>>;
  setTabs: React.Dispatch<React.SetStateAction<TerminalTab[]>>;
  appendLine: (text: string, type?: TerminalLine['type'], isHtml?: boolean) => void;
  appendLineToTab: (tabId: string, text: string, type?: TerminalLine['type'], isHtml?: boolean) => void;
  addLog: (level: ConnectionLog['level'], protocol: string, message: string, target?: string) => void;
  crtConfig: CrtConfig;
  updateCrtConfig: (vals: Partial<CrtConfig>) => void;
  theme: TerminalTheme;
  handleThemeChange: (theme: TerminalTheme) => void;
  typographyConfig: TypographyConfig;
  handleTypographyConfigChange: (vals: Partial<TypographyConfig>) => void;
  handleNewTab: (customTitle?: string, autoSession?: any) => string;
  handleCloseTab: (tabId: string) => void;
  handleRenameTab: (tabId: string, newTitle: string) => void;
  handleSelectTab: (tabId: string) => void;
  exitRemoteSession: (reason?: string) => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  connectTabSocket: (tabId: string, url: string) => void;
  connectAllTabs: (url: string) => void;
  setBrowserInitialUrl: (url: string) => void;
  setIsBrowserOpen: (open: boolean) => void;
  triggerDegauss: () => void;
  isSplitScreen: boolean;
  setIsSplitScreen: React.Dispatch<React.SetStateAction<boolean>>;
  splitTabId: string | null;
  setSplitTabId: React.Dispatch<React.SetStateAction<string | null>>;
  detectedPlatform: string;
  systemInfoLabel: string;
}

export function executeCommand(rawCommand: string, ctx: CommandDispatcherContext): void {
  const {
    currentTab,
    tabSocketsRef,
    setTabs,
    appendLine,
    appendLineToTab,
    addLog,
    crtConfig,
    updateCrtConfig,
    handleThemeChange,
    typographyConfig,
    handleTypographyConfigChange,
    handleNewTab,
    handleCloseTab,
    handleRenameTab,
    handleSelectTab,
    exitRemoteSession,
    backendUrl,
    setBackendUrl,
    connectTabSocket,
    connectAllTabs,
    setBrowserInitialUrl,
    setIsBrowserOpen,
    triggerDegauss,
    isSplitScreen,
    setIsSplitScreen,
    splitTabId,
    setSplitTabId,
    detectedPlatform,
    systemInfoLabel,
    tabs,
    tabsRef,
    activeTabIdRef,
  } = ctx;

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

  // Record history in this tab
  setTabs((prev) =>
    prev.map((t) =>
      t.id === tabId
        ? {
            ...t,
            history: [...t.history, trimmed],
            historyIndex: -1,
          }
        : t
    )
  );

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  // 1. DEGAUSS (Desmagnetização da Bobina Catódica)
  if (cmd === 'degauss' || cmd === 'desmagnetizar' || cmd === 'bobina') {
    triggerDegauss();
    appendLine('[*] BOBINA DE DESMAGNETIZAÇÃO DISPARADA!', 'warning');
    appendLine('[*] Campo eletromagnético AC 60Hz oscilando e expurgando impurezas do fósforo.', 'success');
    addLog('INFO', 'DEGAUSS', 'Bobina de desmagnetização CRT analógica disparada');
    return;
  }

  // 2. SPLIT SCREEN (Dividir Tela Lado a Lado)
  if (cmd === 'split' || cmd === 'splitscreen' || cmd === 'split-screen' || cmd === 'dividir') {
    const sub = args[0]?.toLowerCase();
    if (sub === 'off' || sub === 'close' || sub === 'fechar' || sub === 'desligar') {
      setIsSplitScreen(false);
      appendLine('[*] Visualização Split-Screen DESATIVADA (Modo tela cheia).', 'info');
      addLog('INFO', 'LAYOUT', 'Split-screen desativado');
      return;
    }
    if (sub === 'swap' || sub === 'trocar' || sub === 'inverter') {
      if (splitTabId) {
        const oldActive = currentTab.id;
        handleSelectTab(splitTabId);
        setSplitTabId(oldActive);
        appendLine('[*] Painéis Split-Screen invertidos com sucesso.', 'success');
      }
      return;
    }

    // Toggle split screen
    if (isSplitScreen && !sub) {
      setIsSplitScreen(false);
      appendLine('[*] Visualização Split-Screen fechada.', 'info');
      return;
    }

    // Activate split screen: choose secondary tab
    if (tabs.length < 2) {
      // Cria uma nova aba para poder dividir lado a lado
      const newId = handleNewTab('Console 2 (Split)');
      setSplitTabId(newId);
      setIsSplitScreen(true);
      appendLine('[*] Nova aba criada para Split-Screen lado a lado!', 'success');
      addLog('INFO', 'LAYOUT', 'Split-screen ativado com nova aba');
      return;
    }

    // Find tab different from currentTab
    const otherTab = tabs.find((t) => t.id !== currentTab.id);
    if (otherTab) {
      setSplitTabId(otherTab.id);
      setIsSplitScreen(true);
      appendLine(`[*] Split-Screen ATIVADO: [${currentTab.title}] | [${otherTab.title}]`, 'success');
      appendLine('Comandos: split off | split swap | clique no painel para alternar foco', 'dim');
      addLog('INFO', 'LAYOUT', `Split-screen ativo entre ${currentTab.id} e ${otherTab.id}`);
    }
    return;
  }

  // 3. TAB MANAGEMENT COMMANDS
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

  // 4. CLEAR / CLS
  if (cmd === 'clear' || cmd === 'cls' || cmd === 'limpar') {
    setTabs((prev) =>
      prev.map((t) => (t.id === currentTab.id ? { ...t, lines: [] } : t))
    );
    return;
  }

  // 5. HELP
  if (cmd === 'help' || cmd === 'ajuda' || cmd === '?') {
    printHelp(appendLine);
    return;
  }

  // 6. SHELL SWITCHERS
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

  // 7. THEMES
  if (cmd === 'theme') {
    if (['green', 'amber', 'cyan', 'magenta'].includes(args[0]?.toLowerCase())) {
      handleThemeChange(args[0].toLowerCase() as TerminalTheme);
    } else {
      appendLine('Uso: theme <green | amber | cyan | magenta>', 'warning');
    }
    return;
  }

  // 8. CRT CONFIG
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

  // 9. TYPOGRAPHY
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

  // 10. BROWSER
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

  // 11. BRIGHTNESS, CURVE, VIGNETTE, CURSOR, JITTER, HERTZ, GHOST
  if (cmd === 'brightness' || cmd === 'brilho') {
    const val = parseInt(args[0], 10);
    if (!isNaN(val) && val >= 50 && val <= 250) {
      updateCrtConfig({ brightness: val });
      appendLine(`[*] Brilho da tela CRT ajustado para: ${val}%`, 'success');
    } else {
      appendLine(`[*] Brilho atual: ${crtConfig.brightness ?? 120}%`, 'info');
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
      const curVal = crtConfig.curvature ? (crtConfig.curvatureIntensity ?? 100) : 0;
      appendLine(`[*] Curvatura atual: ${curVal}%`, 'info');
      appendLine('Uso: curve <0 - 100> (ex: curve 100 | curve off)', 'dim');
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
      appendLine(`[*] Vinheta atual: ${crtConfig.vignetteIntensity ?? 35}%`, 'info');
      appendLine('Uso: vinheta <0 - 100> (ex: vinheta 35 | vinheta off)', 'dim');
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
            : `${(crtConfig.cursorBlinkRate ?? 1.4).toFixed(2)}s`
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
    if (!sub) {
      const isAct = crtConfig.jitter;
      appendLine(
        `[*] Nível de tremor CRT (Jitter): ${
          isAct ? 'LIGADO (NÍVEL LEVE)' : 'DESLIGADO'
        }`,
        'info'
      );
      appendLine('Uso: jitter <on|off|ligar|desligar>', 'dim');
      return;
    }
    if (sub === 'off' || sub === 'desligar' || sub === '0') {
      updateCrtConfig({ jitter: false, jitterIntensity: 0 });
      appendLine('[*] Tremor da imagem CRT (Jitter) DESLIGADO', 'info');
    } else if (sub === 'on' || sub === 'ligar' || sub === '1') {
      updateCrtConfig({ jitter: true, jitterIntensity: 15 });
      appendLine('[*] Tremor da imagem CRT (Jitter) LIGADO (Nível Leve)', 'success');
    } else {
      appendLine('Uso: jitter <on|off|ligar|desligar>', 'warning');
    }
    return;
  }

  if (cmd === 'hertz' || cmd === 'hz' || cmd === 'roll' || cmd === 'faixas') {
    const sub = args[0]?.toLowerCase();
    if (!sub) {
      appendLine(
        `[*] Faixas de Hertz CRT: ${crtConfig.hertz ? 'LIGADO' : 'DESLIGADO'} (Velocidade: ${crtConfig.hertzSpeed ?? 15}%, Largura: ${crtConfig.hertzWidth ?? 100}%, Opacidade: ${crtConfig.hertzIntensity ?? 5}%)`,
        'info'
      );
      appendLine('Uso: hertz <on|off> | hertz <velocidade 1-100> [largura 5-100]', 'dim');
      appendLine('     hertz speed <1-100> | hertz width <5-100> | hertz opacity <0-100>', 'dim');
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
        hertzSpeed: crtConfig.hertzSpeed || 15,
        hertzWidth: crtConfig.hertzWidth || 100,
        hertzIntensity: crtConfig.hertzIntensity || 5,
      });
      appendLine(
        `[*] Faixas de Hertz CRT LIGADAS (Velocidade: ${crtConfig.hertzSpeed || 15}%, Largura: ${crtConfig.hertzWidth || 100}%, Opacidade: ${crtConfig.hertzIntensity || 5}%)`,
        'success'
      );
      return;
    }

    if (sub === 'suave' || sub === 'ultra' || sub === 'padrao') {
      updateCrtConfig({ hertz: true, hertzSpeed: 15, hertzWidth: 100, hertzIntensity: 5 });
      appendLine('[*] Preset Hertz Ultra Suave ativado (Velocidade: 15%, Largura: 100%, Opacidade: 5%)', 'success');
      return;
    }

    if (sub === 'speed' || sub === 'vel' || sub === 'velocidade') {
      const val = parseInt(args[1], 10);
      if (isNaN(val) || val < 1 || val > 100) {
        appendLine('Velocidade inválida. Use um número de 1 a 100 (ex: hertz speed 15)', 'error');
        return;
      }
      updateCrtConfig({ hertz: true, hertzSpeed: val });
      appendLine(`[*] Velocidade das faixas de Hertz ajustada para: ${val}%`, 'success');
      return;
    }

    if (sub === 'width' || sub === 'largura' || sub === 'espessura') {
      const val = parseInt(args[1], 10);
      if (isNaN(val) || val < 5 || val > 100) {
        appendLine('Largura inválida. Use um número de 5 a 100 (ex: hertz width 100)', 'error');
        return;
      }
      updateCrtConfig({ hertz: true, hertzWidth: val });
      appendLine(`[*] Largura das faixas de Hertz ajustada para: ${val}%`, 'success');
      return;
    }

    if (sub === 'opacity' || sub === 'opacidade' || sub === 'intensidade' || sub === 'alpha') {
      const val = parseInt(args[1], 10);
      if (isNaN(val) || val < 0 || val > 100) {
        appendLine('Opacidade inválida. Use um número de 0 a 100% (ex: hertz opacity 5)', 'error');
        return;
      }
      updateCrtConfig({ hertz: val > 0, hertzIntensity: val });
      appendLine(`[*] Opacidade das faixas de Hertz ajustada para: ${val}%`, 'success');
      return;
    }

    const speedVal = parseInt(sub.replace('%', ''), 10);
    if (!isNaN(speedVal) && speedVal >= 1 && speedVal <= 100) {
      const widthVal = args[1] ? parseInt(args[1].replace('%', ''), 10) : crtConfig.hertzWidth || 100;
      const validWidth = !isNaN(widthVal) && widthVal >= 5 && widthVal <= 100 ? widthVal : (crtConfig.hertzWidth || 100);
      updateCrtConfig({ hertz: true, hertzSpeed: speedVal, hertzWidth: validWidth });
      appendLine(`[*] Faixas de Hertz CRT ajustadas: Velocidade ${speedVal}%, Largura ${validWidth}%`, 'success');
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

  // 12. REMOTE PROTOCOLS (SSH / Telnet / Ping / Ping-Sweep)
  if (cmd === 'ssh') {
    handleSshDispatch(args, ctx);
    return;
  }

  if (cmd === 'telnet') {
    handleTelnetDispatch(args, ctx);
    return;
  }

  if (cmd === 'ping') {
    handlePingDispatch(args[0] || '127.0.0.1', ctx);
    return;
  }

  if (cmd === 'ping-sweep' || cmd === 'pingsweep' || cmd === 'sweep') {
    handlePingSweepDispatch(args[0] || '', ctx);
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
  handleOfflineDispatch(trimmed, cmd, args, ctx);
}

export function handleSshDispatch(args: string[], ctx: CommandDispatcherContext): void {
  const { currentTab, tabSocketsRef, setTabs, appendLine } = ctx;
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
}

export function handleTelnetDispatch(args: string[], ctx: CommandDispatcherContext): void {
  const { currentTab, tabSocketsRef, setTabs, appendLine, addLog } = ctx;
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
}

export function handlePingFallback(tabId: string, target: string, ctx: CommandDispatcherContext): void {
  const { appendLineToTab, addLog } = ctx;
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
}

export function handlePingDispatch(target: string, ctx: CommandDispatcherContext): void {
  const { currentTab, tabSocketsRef, appendLine, addLog } = ctx;
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
    handlePingFallback(currentTab.id, target, ctx);
  }
}

export function handlePingSweepDispatch(rawSubnet: string, ctx: CommandDispatcherContext): void {
  const { activeTabIdRef, appendLineToTab, addLog, currentTab, tabSocketsRef } = ctx;
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
}

export function handleOfflineDispatch(
  commandLine: string,
  cmd: string,
  args: string[],
  ctx: CommandDispatcherContext
): void {
  const { currentTab, setTabs, appendLine, addLog, detectedPlatform, systemInfoLabel, tabs } = ctx;
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

  appendLine(`'${cmd}' não é reconhecido como um comando interno ou externo.`, 'error');
  appendLine(`Digite 'help' para comandos de rede e atalhos, ou inicie o backend Node.js.`, 'dim');
}

export function printHelp(appendLine: (text: string, type?: TerminalLine['type'], isHtml?: boolean) => void): void {
  appendLine(`================================================================================`, 'info');
  appendLine(`                     CYBERDECK CRT TERMINAL // MANUAL DE COMANDOS               `, 'info');
  appendLine(`================================================================================`, 'info');
  appendLine(`GERENCIAMENTO DE ABAS & MULTI-EQUIPAMENTOS:`, 'warning');
  appendLine(`• tab new [nome]           : Abre uma nova aba para conectar a outro equipamento.`, 'stdout');
  appendLine(`• tab close                : Fecha a aba ativa atual.`, 'stdout');
  appendLine(`• tab rename <nome>        : Renomeia o título da aba atual.`, 'stdout');
  appendLine(`• tab <numero>             : Alterna direto para a aba 1, 2, 3...`, 'stdout');
  appendLine(`• tabs / tab list          : Lista todas as abas abertas e seus status.`, 'stdout');
  appendLine(`• split [off|swap]         : Visualização Split-Screen (Dividir Tela lado a lado).`, 'success');
  appendLine(`• Atalhos de Teclado       : Alt+T (Nova Aba) | Alt+W (Fechar) | Alt+1..9 (Trocar).`, 'success');
  appendLine(``, 'stdout');
  appendLine(`COMANDOS DE REDE & DISPOSITIVOS:`, 'warning');
  appendLine(`• ssh [-i chave.pem] [user@]host [-p porta] : Sessão SSH segura com senha ou chave PEM/pub.`, 'stdout');
  appendLine(`• telnet <host> [porta]    : Conexão direta TCP Socket Telnet (RFC 854) para switches/roteadores.`, 'stdout');
  appendLine(`• ping <host>              : Dispara teste de conectividade ICMP e latência.`, 'stdout');
  appendLine(`• ping-sweep <sub-rede/CIDR>: Varredura de sub-rede e detecção de dispositivos ativos.`, 'stdout');
  appendLine(`• Tecla [TAB]              : Autocompleta comandos conforme o equipamento (Cisco, MikroTik, etc).`, 'success');
  appendLine(``, 'stdout');
  appendLine(`VISUAL & ANALÓGICO CRT:`, 'warning');
  appendLine(`• degauss                  : Dispara a bobina magnética CRT com som analógico Web Audio.`, 'success');
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
}

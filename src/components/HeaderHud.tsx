import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Tv,
  Radio,
  ChevronDown,
  Check,
  Palette,
  Globe,
  Sliders,
  Zap,
  Columns,
} from 'lucide-react';
import {
  TerminalTheme,
  SessionState,
  CrtConfig,
  TypographyConfig,
  SystemMetrics,
} from '../types';
import { CrtConfigModal } from './CrtConfigModal';

interface HeaderHudProps {
  theme: TerminalTheme;
  onThemeChange: (theme: TerminalTheme) => void;
  typographyConfig: TypographyConfig;
  onTypographyConfigChange: (config: Partial<TypographyConfig>) => void;
  crtConfig: CrtConfig;
  onCrtConfigChange: (config: Partial<CrtConfig>) => void;
  activeProtocolName: string;
  sessionState: SessionState;
  backendConnected: boolean;
  systemMetrics?: SystemMetrics | null;
  isBrowserOpen?: boolean;
  onToggleBrowser?: () => void;
  onTriggerDegauss?: () => void;
  isDegaussing?: boolean;
  isSplitScreen?: boolean;
  onToggleSplitScreen?: () => void;
}

const THEMES: { id: TerminalTheme; label: string; color: string; dotClass: string }[] = [
  { id: 'green', label: 'MATRIX GREEN', color: '#00ff66', dotClass: 'bg-emerald-400' },
  { id: 'amber', label: 'AMBER CRT', color: '#ffb000', dotClass: 'bg-amber-400' },
  { id: 'cyan', label: 'NEO CYAN', color: '#00f0ff', dotClass: 'bg-cyan-400' },
  { id: 'magenta', label: 'SYNTHWAVE', color: '#ff0077', dotClass: 'bg-pink-500' },
];

export const HeaderHud: React.FC<HeaderHudProps> = ({
  theme,
  onThemeChange,
  typographyConfig,
  onTypographyConfigChange,
  crtConfig,
  onCrtConfigChange,
  activeProtocolName,
  sessionState,
  backendConnected,
  systemMetrics,
  isBrowserOpen = false,
  onToggleBrowser,
  onTriggerDegauss,
  isDegaussing = false,
  isSplitScreen = false,
  onToggleSplitScreen,
}) => {
  const [clock, setClock] = useState<string>('00:00:00');
  const [isCrtMenuOpen, setIsCrtMenuOpen] = useState<boolean>(false);
  const crtMenuRef = useRef<HTMLDivElement>(null);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    const handleClickOutside = (e: MouseEvent) => {
      if (crtMenuRef.current && !crtMenuRef.current.contains(e.target as Node)) {
        setIsCrtMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(clockInterval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cycleCrtMode = () => {
    if (crtConfig.mode === 'real') {
      onCrtConfigChange({ mode: 'subtle' });
    } else if (crtConfig.mode === 'subtle') {
      onCrtConfigChange({ mode: 'off' });
    } else {
      onCrtConfigChange({ mode: 'real' });
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between border-b crt-glow-box pb-2 mb-2 gap-2 text-xs uppercase tracking-wider shrink-0 relative z-30">
      {/* Brand & Status */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        <div className="flex items-center gap-1.5 font-bold tracking-widest text-sm shrink-0">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="crt-glow font-vt323 text-lg">CYBERDECK // UNIVERSAL TERMINAL</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-current opacity-70">
            HOST: WIN / LINUX / MAC
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-zinc-800 text-[11px] shrink-0">
          <span>LINK:</span>
          {backendConnected ? (
            <span className="line-success flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              NODE.JS CONECTADO
            </span>
          ) : sessionState === 'remote_session' ? (
            <span className="line-info flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              SESSÃO REMOTA ATIVA
            </span>
          ) : (
            <span className="line-warning flex items-center gap-1 font-semibold">
              <Radio className="w-3 h-3 text-amber-400" />
              FRONTEND PRONTO
              <span className="hidden xl:inline">(AGUARDANDO BACKEND)</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Metrics HUD: CPU & RAM Telemetry */}
      <div className="hidden md:flex items-center gap-3 sm:gap-4 text-[11px] shrink-0">
        <div className="hidden lg:flex items-center gap-1">
          <span className="opacity-60">CPU:</span>
          {systemMetrics ? (
            <span className="font-bold text-white crt-glow">
              {systemMetrics.cpu}%
            </span>
          ) : (
            <span className="font-bold text-zinc-500">--%</span>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-1">
          <span className="opacity-60">RAM:</span>
          {systemMetrics ? (
            <span className="font-bold text-white crt-glow" title={`Uso Real: ${systemMetrics.ramUsedMb}MB de ${systemMetrics.ramTotalMb}MB`}>
              {(systemMetrics.ramUsedMb / 1024).toFixed(1)}GB
              <span className="text-[9px] opacity-75 font-normal ml-0.5">({systemMetrics.ramPercent}%)</span>
            </span>
          ) : (
            <span className="font-bold text-zinc-500">--MB</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="opacity-60">SHELL:</span>
          <span className="px-1.5 bg-zinc-900 border border-current rounded text-[10px] font-bold">
            {activeProtocolName}
          </span>
        </div>
        <div className="font-mono text-zinc-400">{clock}</div>
      </div>

      {/* Controls - Always aligned to the right */}
      <div className="flex items-center justify-end gap-2 ml-auto flex-wrap">
        {/* Quick Degauss Button with Web Audio + Visual Jitter */}
        {onTriggerDegauss && (
          <button
            type="button"
            disabled={isDegaussing}
            onClick={onTriggerDegauss}
            title="Desmagnetizar bobina catódica CRT (Degauss Coil) com choque analógico"
            className={`px-2 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition-all ${
              isDegaussing
                ? 'border-amber-400 bg-amber-500/30 text-amber-200 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'border-amber-500/50 bg-black/60 hover:bg-amber-500/20 text-amber-300'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isDegaussing ? 'animate-bounce' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">DEGAUSS</span>
          </button>
        )}

        {/* Quick Split-Screen Toggle Button */}
        {onToggleSplitScreen && (
          <button
            type="button"
            onClick={onToggleSplitScreen}
            title={isSplitScreen ? 'Desativar Split-Screen (Modo tela cheia)' : 'Dividir Tela Lado a Lado (Split-Screen)'}
            className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              isSplitScreen
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'border-current bg-black/60 crt-glow-box hover:bg-white/10 text-current'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SPLIT</span>
          </button>
        )}

        {/* Integrated Cyber-Browser Button */}
        {onToggleBrowser && (
          <button
            type="button"
            onClick={onToggleBrowser}
            title="Abrir Navegador Web Integrado (Cyber-Net Browser) com efeito CRT"
            className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              isBrowserOpen
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                : 'border-current bg-black/60 crt-glow-box hover:bg-white/10 text-current'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 text-current ${isBrowserOpen ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span className="tracking-wider">WEB</span>
          </button>
        )}

        {/* CRT Real Filter Selector & Settings Popover */}
        <div className="relative" ref={crtMenuRef}>
          <div className="flex items-center">
            <button
              type="button"
              onClick={cycleCrtMode}
              title="Clique para alternar o modo CRT (Real / Leve / Off)"
              className={`px-2.5 py-1 rounded-l border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                crtConfig.mode === 'real'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                  : crtConfig.mode === 'subtle'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  : 'bg-black/60 border-zinc-800 text-zinc-500'
              }`}
            >
              <Tv className={`w-3.5 h-3.5 ${crtConfig.mode === 'real' ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>
                {crtConfig.mode === 'real'
                  ? 'CRT REAL'
                  : crtConfig.mode === 'subtle'
                  ? 'CRT LEVE'
                  : 'CRT OFF'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsCrtMenuOpen(!isCrtMenuOpen)}
              title="Configurações completas de Tela CRT, Brilho, Curvatura, Vinheta, Degauss e Fontes"
              className={`px-2 py-1 rounded-r border-y border-r text-[11px] transition-colors flex items-center gap-1 ${
                crtConfig.mode === 'real'
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <Sliders className="w-3 h-3 text-emerald-400" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* CRT & Display Settings Centered Popup Window */}
          {isCrtMenuOpen && (
            <CrtConfigModal
              isOpen={isCrtMenuOpen}
              onClose={() => setIsCrtMenuOpen(false)}
              crtConfig={crtConfig}
              onCrtConfigChange={onCrtConfigChange}
              typographyConfig={typographyConfig}
              onTypographyConfigChange={onTypographyConfigChange}
              onTriggerDegauss={onTriggerDegauss}
              isDegaussing={isDegaussing}
            />
          )}
        </div>

        {/* Custom Retro CRT Theme Selector */}
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen);
              setIsCrtMenuOpen(false);
            }}
            title="Escolher fósforo da tela (Cor do CRT)"
            className="px-2 py-1 rounded border border-current bg-black/60 crt-glow-box hover:bg-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-all text-current"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                THEMES.find((t) => t.id === theme)?.dotClass || 'bg-emerald-400'
              } animate-pulse`}
            />
            <span className="tracking-wider">
              {THEMES.find((t) => t.id === theme)?.label || 'MATRIX GREEN'}
            </span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isThemeMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 max-w-[calc(100vw-2.5rem)] bg-zinc-950/95 border border-current rounded-md p-1.5 shadow-[0_0_25px_rgba(0,0,0,0.95)] z-50 font-mono text-xs backdrop-blur-md crt-glow-box">
              <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider opacity-65 border-b border-white/10 mb-1 flex items-center justify-between text-current">
                <span>Fósforo CRT</span>
                <Palette className="w-3 h-3 opacity-80" />
              </div>
              <div className="space-y-0.5">
                {THEMES.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onThemeChange(item.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded flex items-center justify-between text-left transition-all text-[11px] font-bold ${
                      theme === item.id
                        ? 'bg-white/15 text-white border border-current'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                    style={{
                      textShadow: theme === item.id ? `0 0 10px ${item.color}` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${item.dotClass} ${
                          theme === item.id ? 'animate-pulse' : ''
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {theme === item.id && <Check className="w-3.5 h-3.5 text-current" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

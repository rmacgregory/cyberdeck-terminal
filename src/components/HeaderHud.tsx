import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Tv, Radio, Sparkles, ChevronDown, Check, Palette, Type, Globe, Sun, Sliders, Monitor, Eye, Activity, Waves } from 'lucide-react';
import {
  TerminalTheme,
  SessionState,
  CrtConfig,
  TypographyConfig,
  TerminalFontFamily,
  TerminalFontSize,
  TerminalLineSpacing,
  SystemMetrics,
} from '../types';

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
}

export const FONTS: { id: TerminalFontFamily; name: string; tag: string; fontClass: string; desc: string }[] = [
  { id: 'share-tech', name: 'Share Tech Mono', tag: 'CYBER HUD', fontClass: 'font-share-tech', desc: 'Monospace tático militar cyberpunk' },
  { id: 'vt323', name: 'VT323 (DEC CRT)', tag: 'RETRO 80s', fontClass: 'font-vt323', desc: 'Tubo pixelado original DEC VT220' },
  { id: 'fira-code', name: 'Fira Code', tag: 'HACKER DEV', fontClass: 'font-fira-code', desc: 'Código limpo com ligaduras técnicas' },
  { id: 'jetbrains', name: 'JetBrains Mono', tag: 'PRO RETRO', fontClass: 'font-jetbrains', desc: 'Alta definição e clareza de leitura' },
];

export const FONT_SIZES: { id: TerminalFontSize; label: string; desc: string; px: string }[] = [
  { id: 'sm', label: 'PEQUENA', desc: '12px', px: '12px' },
  { id: 'md', label: 'MÉDIA', desc: '14px', px: '14px' },
  { id: 'lg', label: 'GRANDE', desc: '16px', px: '16px' },
];

export const LINE_SPACINGS: { id: TerminalLineSpacing; label: string; desc: string; factor: string }[] = [
  { id: 'tight', label: 'COMPACTO', desc: '1.25x', factor: '1.25x' },
  { id: 'normal', label: 'NORMAL', desc: '1.55x', factor: '1.55x' },
  { id: 'loose', label: 'ESPAÇADO', desc: '1.95x', factor: '1.95x' },
];

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
}) => {
  const [clock, setClock] = useState<string>('00:00:00');
  const [isCrtMenuOpen, setIsCrtMenuOpen] = useState<boolean>(false);
  const [crtSubTab, setCrtSubTab] = useState<'display' | 'typography'>('display');
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

  // Dynamic CRT Display Values
  const currentCurvature = crtConfig.curvature ? (crtConfig.curvatureIntensity ?? 50) : 0;
  const currentBrightness = crtConfig.brightness ?? 115;
  const currentVignette = crtConfig.vignetteIntensity ?? 70;

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

      {/* Quick Metrics HUD: Telemetria Real de CPU e RAM do Sistema */}
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

      {/* Controls - Always aligned to the right, even on line-break */}
      <div className="flex items-center justify-end gap-2 ml-auto flex-wrap">
        {/* Integrated Cyber-Browser Button with Internet Logo */}
        {onToggleBrowser && (
          <button
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

        {/* CRT Real Filter Selector & Comprehensive Settings (Includes Font Configuration) */}
        <div className="relative" ref={crtMenuRef}>
          <div className="flex items-center">
            <button
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
              onClick={() => setIsCrtMenuOpen(!isCrtMenuOpen)}
              title="Configurações completas de Tela CRT, Brilho, Curvatura, Vinheta e Fontes"
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

          {/* CRT & Display Settings Popover */}
          {isCrtMenuOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2.5rem)] bg-zinc-950/98 border border-emerald-500/60 rounded-lg p-3.5 shadow-2xl z-50 text-[11px] normal-case space-y-3 font-mono backdrop-blur-md max-h-[85vh] overflow-y-auto cyber-scrollbar">
              {/* Header with Sub-tabs */}
              <div className="border-b border-zinc-800 pb-2">
                <div className="flex items-center justify-between uppercase font-bold text-emerald-400 tracking-wider mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Configurações de Tela CRT
                  </span>
                  <span className="text-[10px] opacity-70">Cool-Retro-Term</span>
                </div>

                {/* Internal Tabs: Display & Optics vs Typography */}
                <div className="flex gap-1 bg-black/60 p-0.5 rounded border border-zinc-800">
                  <button
                    onClick={() => setCrtSubTab('display')}
                    className={`flex-1 py-1 px-2 rounded text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      crtSubTab === 'display'
                        ? 'bg-emerald-500/25 border border-emerald-400/80 text-emerald-300 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>CRT & BRILHO</span>
                  </button>
                  <button
                    onClick={() => setCrtSubTab('typography')}
                    className={`flex-1 py-1 px-2 rounded text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      crtSubTab === 'typography'
                        ? 'bg-emerald-500/25 border border-emerald-400/80 text-emerald-300 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Type className="w-3 h-3" />
                    <span>FONTES & TEXTO</span>
                  </button>
                </div>
              </div>

              {crtSubTab === 'display' ? (
                <>
                  {/* Mode Select */}
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">Modo de Exibição</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => onCrtConfigChange({ mode: 'real' })}
                        className={`py-1.5 px-1 rounded text-center font-bold border transition-all ${
                          crtConfig.mode === 'real'
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                            : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                        }`}
                      >
                        Tubo Real
                      </button>
                      <button
                        onClick={() => onCrtConfigChange({ mode: 'subtle' })}
                        className={`py-1.5 px-1 rounded text-center font-bold border transition-all ${
                          crtConfig.mode === 'subtle'
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                            : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                        }`}
                      >
                        Leve
                      </button>
                      <button
                        onClick={() => onCrtConfigChange({ mode: 'off' })}
                        className={`py-1.5 px-1 rounded text-center font-bold border transition-all ${
                          crtConfig.mode === 'off'
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                            : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>

                  {/* 1. Brightness Configuration */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 text-[10px] uppercase font-bold flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        Brilho da Tela CRT
                      </span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {currentBrightness}%
                      </span>
                    </div>

                    {/* Brightness Slider */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCrtConfigChange({ brightness: Math.max(70, currentBrightness - 10) })}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-bold"
                        title="Diminuir brilho em 10%"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="70"
                        max="200"
                        step="5"
                        value={currentBrightness}
                        onChange={(e) => onCrtConfigChange({ brightness: Number(e.target.value) })}
                        className="flex-1 accent-emerald-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                      />
                      <button
                        onClick={() => onCrtConfigChange({ brightness: Math.min(200, currentBrightness + 10) })}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-bold"
                        title="Aumentar brilho em 10%"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Brightness Presets */}
                    <div className="grid grid-cols-5 gap-1 pt-0.5">
                      {[
                        { label: '80%', val: 80 },
                        { label: '100%', val: 100 },
                        { label: '120%', val: 120 },
                        { label: '150%', val: 150 },
                        { label: '180%', val: 180 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => onCrtConfigChange({ brightness: item.val })}
                          className={`py-0.5 rounded text-[10px] border text-center transition-all ${
                            currentBrightness === item.val
                              ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300 font-bold'
                              : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Curvature Configuration */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 text-[10px] uppercase font-bold flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        Curvatura do Tubo CRT
                      </span>
                      <span className="text-cyan-400 font-bold font-mono">
                        {currentCurvature === 0 ? 'DESLIGADA' : `${currentCurvature}%`}
                      </span>
                    </div>

                    {/* Curvature Slider */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nextVal = Math.max(0, currentCurvature - 10);
                          onCrtConfigChange({
                            curvatureIntensity: nextVal,
                            curvature: nextVal > 0,
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-bold"
                        title="Diminuir curvatura"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentCurvature}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onCrtConfigChange({
                            curvatureIntensity: val,
                            curvature: val > 0,
                          });
                        }}
                        className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          const nextVal = Math.min(100, currentCurvature + 10);
                          onCrtConfigChange({
                            curvatureIntensity: nextVal,
                            curvature: nextVal > 0,
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-bold"
                        title="Aumentar curvatura"
                      >
                        +
                      </button>
                    </div>

                    {/* Curvature Presets */}
                    <div className="grid grid-cols-4 gap-1 pt-0.5">
                      {[
                        { label: 'Plano (0%)', val: 0 },
                        { label: 'Suave (30%)', val: 30 },
                        { label: 'Clássico (50%)', val: 50 },
                        { label: 'Extremo (100%)', val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() =>
                            onCrtConfigChange({
                              curvatureIntensity: preset.val,
                              curvature: preset.val > 0,
                            })
                          }
                          className={`py-0.5 px-1 rounded text-[9px] border text-center transition-all truncate ${
                            currentCurvature === preset.val
                              ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 font-bold'
                              : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Vignette Intensity Configuration (Nova função solicitada) */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 text-[10px] uppercase font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        Intensidade da Vinheta (Bordas)
                      </span>
                      <span className="text-purple-400 font-bold font-mono">
                        {currentVignette === 0 ? 'DESLIGADA' : `${currentVignette}%`}
                      </span>
                    </div>

                    {/* Vignette Slider */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCrtConfigChange({ vignetteIntensity: Math.max(0, currentVignette - 10) })}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-bold"
                        title="Diminuir vinheta em 10%"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentVignette}
                        onChange={(e) => onCrtConfigChange({ vignetteIntensity: Number(e.target.value) })}
                        className="flex-1 accent-purple-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                      />
                      <button
                        onClick={() => onCrtConfigChange({ vignetteIntensity: Math.min(100, currentVignette + 10) })}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-bold"
                        title="Aumentar vinheta em 10%"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Vignette Presets */}
                    <div className="grid grid-cols-4 gap-1 pt-0.5">
                      {[
                        { label: 'Off (0%)', val: 0 },
                        { label: 'Suave (35%)', val: 35 },
                        { label: 'Padrão (70%)', val: 70 },
                        { label: 'Escura (95%)', val: 95 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() => onCrtConfigChange({ vignetteIntensity: preset.val })}
                          className={`py-0.5 px-1 rounded text-[9px] border text-center transition-all truncate ${
                            currentVignette === preset.val
                              ? 'border-purple-400 bg-purple-500/25 text-purple-200 font-bold'
                              : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bloom / Glow Level */}
                  <div className="space-y-1 pt-1 border-t border-zinc-900">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">Brilho do Fósforo (Bloom)</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => onCrtConfigChange({ bloom: 'extreme' })}
                        className={`py-1 rounded text-center border ${
                          crtConfig.bloom === 'extreme'
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Extremo
                      </button>
                      <button
                        onClick={() => onCrtConfigChange({ bloom: 'normal' })}
                        className={`py-1 rounded text-center border ${
                          crtConfig.bloom === 'normal'
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => onCrtConfigChange({ bloom: 'soft' })}
                        className={`py-1 rounded text-center border ${
                          crtConfig.bloom === 'soft'
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Suave
                      </button>
                    </div>
                  </div>

                  {/* CRT Screen Jitter / Tremor Level */}
                  <div className="space-y-1.5 pt-1.5 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Activity className={`w-3.5 h-3.5 ${crtConfig.jitter ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
                        <span className="text-[10px] uppercase font-bold">Tremor do Tubo (Jitter)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {crtConfig.jitter && (crtConfig.jitterIntensity ?? 30) > 0
                            ? `${crtConfig.jitterIntensity ?? 30}%`
                            : 'Desligado'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onCrtConfigChange({
                              jitter: !crtConfig.jitter,
                              jitterIntensity: crtConfig.jitterIntensity ?? 30,
                            })
                          }
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold transition-all ${
                            crtConfig.jitter
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                              : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {crtConfig.jitter ? 'LIGADO' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {/* Jitter Slider & Stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nextVal = Math.max(0, (crtConfig.jitterIntensity ?? 30) - 5);
                          onCrtConfigChange({ jitter: nextVal > 0, jitterIntensity: nextVal });
                        }}
                        title="Diminuir tremor da imagem"
                        className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-amber-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={crtConfig.jitter ? (crtConfig.jitterIntensity ?? 30) : 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onCrtConfigChange({ jitter: val > 0, jitterIntensity: val });
                        }}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          const nextVal = Math.min(100, (crtConfig.jitterIntensity ?? 30) + 5);
                          onCrtConfigChange({ jitter: true, jitterIntensity: nextVal });
                        }}
                        title="Aumentar tremor da imagem"
                        className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-amber-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Jitter Presets */}
                    <div className="grid grid-cols-5 gap-1 pt-0.5">
                      {[
                        { label: 'Off (0%)', val: 0 },
                        { label: 'Leve (15%)', val: 15 },
                        { label: 'Tubo (35%)', val: 35 },
                        { label: 'Forte (65%)', val: 65 },
                        { label: 'Caos (100%)', val: 100 },
                      ].map((preset) => {
                        const isSelected =
                          preset.val === 0
                            ? !crtConfig.jitter || (crtConfig.jitterIntensity ?? 30) === 0
                            : crtConfig.jitter && (crtConfig.jitterIntensity ?? 30) === preset.val;
                        return (
                          <button
                            key={preset.val}
                            onClick={() =>
                              onCrtConfigChange({
                                jitter: preset.val > 0,
                                jitterIntensity: preset.val,
                              })
                            }
                            className={`py-0.5 px-1 rounded text-[9px] font-mono border text-center transition-all truncate ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/25 text-amber-200 font-bold'
                                : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terminal Cursor Blink Rate */}
                  <div className="space-y-1.5 pt-1.5 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] uppercase font-bold">Cursor: Piscada (Blink Rate)</span>
                        <span className="term-cursor inline-block ml-1" style={{ verticalAlign: 'middle', height: '1em' }} />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {crtConfig.cursorBlinkRate === 0
                          ? 'Estático (Solid)'
                          : `${(crtConfig.cursorBlinkRate ?? 0.9).toFixed(2)}s`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onCrtConfigChange({
                            cursorBlinkRate: Math.max(0, Number(((crtConfig.cursorBlinkRate ?? 0.9) - 0.1).toFixed(2))),
                          })
                        }
                        title="Acelerar piscada (ou deixar estático)"
                        className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-emerald-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={crtConfig.cursorBlinkRate ?? 0.9}
                        onChange={(e) =>
                          onCrtConfigChange({ cursorBlinkRate: parseFloat(e.target.value) })
                        }
                        className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                      />
                      <button
                        onClick={() =>
                          onCrtConfigChange({
                            cursorBlinkRate: Math.min(2.0, Number(((crtConfig.cursorBlinkRate ?? 0.9) + 0.1).toFixed(2))),
                          })
                        }
                        title="Tornar piscada mais lenta"
                        className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-emerald-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1 pt-0.5">
                      {[
                        { label: 'Off / Solid', rate: 0 },
                        { label: 'Turbo (0.25s)', rate: 0.25 },
                        { label: 'Rápido (0.5s)', rate: 0.5 },
                        { label: 'Padrão (0.9s)', rate: 0.9 },
                        { label: 'Lento (1.4s)', rate: 1.4 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => onCrtConfigChange({ cursorBlinkRate: preset.rate })}
                          className={`py-0.5 px-1 rounded text-[9px] font-mono border text-center transition-all ${
                            (crtConfig.cursorBlinkRate ?? 0.9) === preset.rate
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                              : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Efeito das Faixas de Hertz / Varredura (Roll Bars) */}
                  <div className="space-y-2 pt-1.5 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Waves className={`w-3.5 h-3.5 ${crtConfig.hertz ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'}`} />
                        <span className="text-[10px] uppercase font-bold">Faixas de Hertz (Varredura)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          {crtConfig.hertz ? 'LIGADO' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onCrtConfigChange({
                              hertz: !crtConfig.hertz,
                              hertzSpeed: crtConfig.hertzSpeed ?? 45,
                              hertzWidth: crtConfig.hertzWidth ?? 40,
                            })
                          }
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold transition-all ${
                            crtConfig.hertz
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                              : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {crtConfig.hertz ? 'LIGADO' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {/* 1. Velocidade das Faixas */}
                    <div className="space-y-1 bg-black/40 p-2 rounded border border-zinc-800/80">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-bold">Velocidade:</span>
                        <span className="text-cyan-300 font-mono font-bold">
                          {crtConfig.hertzSpeed ?? 45}% (~{(15 * Math.pow(0.04, (crtConfig.hertzSpeed ?? 45) / 100)).toFixed(1)}s/ciclo)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const nextVal = Math.max(1, (crtConfig.hertzSpeed ?? 45) - 5);
                            onCrtConfigChange({ hertz: true, hertzSpeed: nextVal });
                          }}
                          title="Diminuir velocidade (varredura mais lenta)"
                          className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={crtConfig.hertzSpeed ?? 45}
                          onChange={(e) =>
                            onCrtConfigChange({
                              hertz: true,
                              hertzSpeed: parseInt(e.target.value, 10),
                            })
                          }
                          className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            const nextVal = Math.min(100, (crtConfig.hertzSpeed ?? 45) + 5);
                            onCrtConfigChange({ hertz: true, hertzSpeed: nextVal });
                          }}
                          title="Aumentar velocidade (varredura mais rápida)"
                          className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Presets de Velocidade */}
                      <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {[
                          { label: 'Lento (15%)', val: 15 },
                          { label: 'Médio (45%)', val: 45 },
                          { label: 'Rápido (75%)', val: 75 },
                          { label: '60Hz (100%)', val: 100 },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => onCrtConfigChange({ hertz: true, hertzSpeed: item.val })}
                            className={`py-0.5 px-1 rounded text-[9px] font-mono border text-center transition-all truncate ${
                              (crtConfig.hertzSpeed ?? 45) === item.val && crtConfig.hertz
                                ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 font-bold'
                                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Largura das Faixas */}
                    <div className="space-y-1 bg-black/40 p-2 rounded border border-zinc-800/80">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-bold">Largura das Faixas:</span>
                        <span className="text-cyan-300 font-mono font-bold">
                          {crtConfig.hertzWidth ?? 40}% (~{Math.round(25 + ((crtConfig.hertzWidth ?? 40) / 100) * 395)}px)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const nextVal = Math.max(5, (crtConfig.hertzWidth ?? 40) - 5);
                            onCrtConfigChange({ hertz: true, hertzWidth: nextVal });
                          }}
                          title="Diminuir largura das faixas"
                          className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="1"
                          value={crtConfig.hertzWidth ?? 40}
                          onChange={(e) =>
                            onCrtConfigChange({
                              hertz: true,
                              hertzWidth: parseInt(e.target.value, 10),
                            })
                          }
                          className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            const nextVal = Math.min(100, (crtConfig.hertzWidth ?? 40) + 5);
                            onCrtConfigChange({ hertz: true, hertzWidth: nextVal });
                          }}
                          title="Aumentar largura das faixas"
                          className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Presets de Largura */}
                      <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {[
                          { label: 'Fina (15%)', val: 15 },
                          { label: 'Média (40%)', val: 40 },
                          { label: 'Larga (70%)', val: 70 },
                          { label: 'Macro (100%)', val: 100 },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => onCrtConfigChange({ hertz: true, hertzWidth: item.val })}
                            className={`py-0.5 px-1 rounded text-[9px] font-mono border text-center transition-all truncate ${
                              (crtConfig.hertzWidth ?? 40) === item.val && crtConfig.hertz
                                ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 font-bold'
                                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Opacidade / Transparência das Faixas */}
                    <div className="space-y-1 bg-black/40 p-2 rounded border border-zinc-800/80">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-bold">Transparência / Intensidade:</span>
                        <span className="text-cyan-300 font-mono font-bold">
                          {crtConfig.hertzIntensity ?? 30}% ({(crtConfig.hertzIntensity ?? 30) <= 25 ? 'Ultra Suave' : (crtConfig.hertzIntensity ?? 30) <= 45 ? 'Suave' : 'Marcada'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const nextVal = Math.max(0, (crtConfig.hertzIntensity ?? 30) - 5);
                            onCrtConfigChange({ hertz: nextVal > 0, hertzIntensity: nextVal });
                          }}
                          title="Tornar faixas mais transparentes e suaves"
                          className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={crtConfig.hertzIntensity ?? 30}
                          onChange={(e) =>
                            onCrtConfigChange({
                              hertz: true,
                              hertzIntensity: parseInt(e.target.value, 10),
                            })
                          }
                          className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            const nextVal = Math.min(100, (crtConfig.hertzIntensity ?? 30) + 5);
                            onCrtConfigChange({ hertz: true, hertzIntensity: nextVal });
                          }}
                          title="Aumentar intensidade das faixas"
                          className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Presets de Opacidade */}
                      <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {[
                          { label: 'Invisível (10%)', val: 10 },
                          { label: 'Suave (25%)', val: 25 },
                          { label: 'Padrão (35%)', val: 35 },
                          { label: 'Marcada (60%)', val: 60 },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => onCrtConfigChange({ hertz: true, hertzIntensity: item.val })}
                            className={`py-0.5 px-1 rounded text-[9px] font-mono border text-center transition-all truncate ${
                              (crtConfig.hertzIntensity ?? 30) === item.val && crtConfig.hertz
                                ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 font-bold'
                                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Presets Combinados de Hertz */}
                    <div className="grid grid-cols-5 gap-1 pt-0.5">
                      {[
                        { label: 'Off', hertz: false, speed: 0, width: 40, intensity: 0 },
                        { label: 'Ultra Suave', hertz: true, speed: 30, width: 35, intensity: 20 },
                        { label: '50Hz Drift', hertz: true, speed: 25, width: 30, intensity: 25 },
                        { label: '60Hz CRT', hertz: true, speed: 45, width: 40, intensity: 30 },
                        { label: 'Interferência', hertz: true, speed: 70, width: 60, intensity: 45 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() =>
                            onCrtConfigChange({
                              hertz: preset.hertz,
                              ...(preset.hertz ? { hertzSpeed: preset.speed, hertzWidth: preset.width, hertzIntensity: preset.intensity } : {}),
                            })
                          }
                          className={`py-0.5 px-1 rounded text-[9px] font-mono border text-center transition-all truncate ${
                            !preset.hertz && !crtConfig.hertz
                              ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 font-bold'
                              : crtConfig.hertz &&
                                (crtConfig.hertzSpeed ?? 45) === preset.speed &&
                                (crtConfig.hertzWidth ?? 40) === preset.width
                              ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 font-bold'
                              : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-1 border-t border-zinc-900 text-zinc-300 text-[11px]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Grade de Fósforo (Aperture Grille)</span>
                      <input
                        type="checkbox"
                        checked={crtConfig.scanlines}
                        onChange={(e) => onCrtConfigChange({ scanlines: e.target.checked })}
                        className="accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </>
              ) : (
                /* Typography Section inside CRT Config Modal */
                <div className="space-y-3">
                  {/* 1. Font Family */}
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">1. Família da Fonte</span>
                    <div className="space-y-1">
                      {FONTS.map((f) => {
                        const isSelected = typographyConfig.family === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => onTypographyConfigChange({ family: f.id })}
                            className={`w-full px-2.5 py-1.5 rounded flex items-center justify-between text-left border transition-all ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 font-bold text-emerald-300 shadow-sm'
                                : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm ${f.fontClass} tracking-wide truncate`}>
                                {f.name}
                              </span>
                              <span className="text-[9px] px-1 py-0.2 rounded border border-current opacity-70 uppercase shrink-0">
                                {f.tag}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Font Size */}
                  <div className="space-y-1 pt-1 border-t border-zinc-900">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">2. Tamanho da Fonte</span>
                    <div className="grid grid-cols-3 gap-1">
                      {FONT_SIZES.map((s) => {
                        const isSelected = typographyConfig.size === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => onTypographyConfigChange({ size: s.id })}
                            className={`py-1.5 px-1 rounded text-center border transition-all ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 font-bold text-emerald-300'
                                : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                            }`}
                          >
                            <div className="text-[11px] font-bold">{s.label}</div>
                            <div className="text-[9px] opacity-65">{s.px}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Line Spacing */}
                  <div className="space-y-1 pt-1 border-t border-zinc-900">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">3. Espaço entre Linhas</span>
                    <div className="grid grid-cols-3 gap-1">
                      {LINE_SPACINGS.map((sp) => {
                        const isSelected = typographyConfig.spacing === sp.id;
                        return (
                          <button
                            key={sp.id}
                            onClick={() => onTypographyConfigChange({ spacing: sp.id })}
                            className={`py-1.5 px-1 rounded text-center border transition-all ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 font-bold text-emerald-300'
                                : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                            }`}
                          >
                            <div className="text-[11px] font-bold">{sp.label}</div>
                            <div className="text-[9px] opacity-65">{sp.factor}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-zinc-500 italic text-center pt-1 border-t border-zinc-900">
                Comandos: <span className="text-emerald-400 font-bold">brightness 150</span> • <span className="text-cyan-400 font-bold">curve 70</span> • <span className="text-purple-400 font-bold">vinheta 80</span> • <span className="text-amber-400 font-bold">jitter 35</span> • <span className="text-cyan-300 font-bold">hertz 50 40</span> • <span className="text-pink-400 font-bold">cursor 0.5s</span>
              </div>
            </div>
          )}
        </div>

        {/* Custom Retro CRT Theme Selector */}
        <div className="relative" ref={themeMenuRef}>
          <button
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

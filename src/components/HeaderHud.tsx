import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Tv, Radio, Sparkles, ChevronDown, Check, Palette, Type, Globe, Sun, Sliders, Monitor } from 'lucide-react';
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
  const [isTypoMenuOpen, setIsTypoMenuOpen] = useState<boolean>(false);
  const typoMenuRef = useRef<HTMLDivElement>(null);

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
      if (typoMenuRef.current && !typoMenuRef.current.contains(e.target as Node)) {
        setIsTypoMenuOpen(false);
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

  // Curvature intensity defaults
  const currentCurvature = crtConfig.curvature ? (crtConfig.curvatureIntensity ?? 50) : 0;
  const currentBrightness = crtConfig.brightness ?? 115;

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

        {/* CRT Real Filter Selector & Comprehensive Settings */}
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
              title="Configurações avançadas do CRT, Brilho, Curvatura e Fontes"
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

                {/* Internal Tabs: Display & Curvature vs Typography */}
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

                  {/* 1. Brightness Configuration (Nova função solicitada) */}
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

                  {/* 2. Curvature Configuration (Nova função ajustável solicitada) */}
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

                  {/* Toggles */}
                  <div className="space-y-2 pt-1 border-t border-zinc-900 text-zinc-300 text-[11px]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Moldura de Monitor Vintage (Bezel)</span>
                      <input
                        type="checkbox"
                        checked={crtConfig.bezel}
                        onChange={(e) => onCrtConfigChange({ bezel: e.target.checked })}
                        className="accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>
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
                Comandos de terminal: <span className="text-emerald-400 font-bold">crt real</span> • <span className="text-emerald-400 font-bold">brightness 150</span> • <span className="text-emerald-400 font-bold">curve 70</span>
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

        {/* Quick Typography Button (Também mantido no header para acesso rápido) */}
        <div className="relative" ref={typoMenuRef}>
          <button
            onClick={() => {
              setIsTypoMenuOpen(!isTypoMenuOpen);
              setIsCrtMenuOpen(false);
              setIsThemeMenuOpen(false);
            }}
            title="Tipografia: Fonte, Tamanho e Espaço entre Linhas"
            className={`px-2 py-1 rounded border border-current bg-black/60 crt-glow-box hover:bg-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-all text-current ${
              isTypoMenuOpen ? 'bg-white/15' : ''
            }`}
          >
            <Type className="w-3.5 h-3.5 text-current" />
            <span className="hidden sm:inline tracking-wider">
              {FONTS.find((f) => f.id === typographyConfig.family)?.name.split(' ')[0] || 'FONTE'}
            </span>
            <span className="text-[10px] opacity-75 px-1 py-0.2 rounded border border-current/40">
              {typographyConfig.size.toUpperCase()} • {typographyConfig.spacing === 'tight' ? 'COMP' : typographyConfig.spacing === 'loose' ? 'ESPAÇ' : 'NORM'}
            </span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isTypoMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isTypoMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] bg-zinc-950/98 border border-current rounded-lg p-3 shadow-[0_0_30px_rgba(0,0,0,0.95)] z-50 text-[11px] normal-case space-y-3 font-mono backdrop-blur-md crt-glow-box text-current">
              <div className="flex items-center justify-between border-b border-white/15 pb-1.5 uppercase font-bold tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  Tipografia do Terminal
                </span>
                <span className="text-[10px] opacity-70">4 Fontes • 3 Tamanhos</span>
              </div>

              {/* 1. Font Family */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold opacity-70">1. Família da Fonte</span>
                <div className="space-y-1">
                  {FONTS.map((f) => {
                    const isSelected = typographyConfig.family === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => onTypographyConfigChange({ family: f.id })}
                        className={`w-full px-2.5 py-1.5 rounded flex items-center justify-between text-left border transition-all ${
                          isSelected
                            ? 'border-current bg-white/15 font-bold shadow-[0_0_10px_var(--glow-color-bg)]'
                            : 'border-white/10 hover:border-white/30 hover:bg-white/5 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm ${f.fontClass} tracking-wide truncate`}>
                            {f.name}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded border border-current/40 uppercase opacity-75 shrink-0">
                            {f.tag}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-current shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Font Size */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold opacity-70">2. Tamanho da Fonte</span>
                <div className="grid grid-cols-3 gap-1">
                  {FONT_SIZES.map((s) => {
                    const isSelected = typographyConfig.size === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => onTypographyConfigChange({ size: s.id })}
                        className={`py-1.5 px-1 rounded text-center border transition-all ${
                          isSelected
                            ? 'border-current bg-white/15 font-bold text-white shadow-[0_0_8px_var(--glow-color-bg)]'
                            : 'border-white/10 opacity-75 hover:opacity-100 hover:bg-white/5'
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
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold opacity-70">3. Espaço entre Linhas</span>
                <div className="grid grid-cols-3 gap-1">
                  {LINE_SPACINGS.map((sp) => {
                    const isSelected = typographyConfig.spacing === sp.id;
                    return (
                      <button
                        key={sp.id}
                        onClick={() => onTypographyConfigChange({ spacing: sp.id })}
                        className={`py-1.5 px-1 rounded text-center border transition-all ${
                          isSelected
                            ? 'border-current bg-white/15 font-bold text-white shadow-[0_0_8px_var(--glow-color-bg)]'
                            : 'border-white/10 opacity-75 hover:opacity-100 hover:bg-white/5'
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
        </div>
      </div>
    </header>
  );
};

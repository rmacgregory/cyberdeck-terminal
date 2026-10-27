import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Monitor,
  Type,
  Sun,
  Sliders,
  Eye,
  Activity,
  Terminal,
  Waves,
  Ghost,
  Check,
  Zap,
  X,
} from 'lucide-react';
import {
  CrtConfig,
  TypographyConfig,
  TerminalFontFamily,
  TerminalFontSize,
  TerminalLineSpacing,
} from '../types';

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

interface CrtConfigModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  crtConfig: CrtConfig;
  onCrtConfigChange: (config: Partial<CrtConfig>) => void;
  typographyConfig: TypographyConfig;
  onTypographyConfigChange: (config: Partial<TypographyConfig>) => void;
  onTriggerDegauss?: () => void;
  isDegaussing?: boolean;
}

export const CrtConfigModal: React.FC<CrtConfigModalProps> = ({
  onClose,
  crtConfig,
  onCrtConfigChange,
  typographyConfig,
  onTypographyConfigChange,
  onTriggerDegauss,
  isDegaussing = false,
}) => {
  const [crtSubTab, setCrtSubTab] = useState<'display' | 'typography'>('display');

  const currentCurvature = crtConfig.curvature ? (crtConfig.curvatureIntensity ?? 100) : 0;
  const currentBrightness = crtConfig.brightness ?? 120;
  const currentVignette = crtConfig.vignetteIntensity ?? 35;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl md:max-w-2xl bg-zinc-950/98 border border-emerald-500/70 rounded-xl shadow-[0_0_50px_rgba(0,255,102,0.25)] flex flex-col max-h-[90vh] overflow-hidden text-[11px] sm:text-xs font-mono text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header of Centered Window */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2 font-bold text-emerald-400 tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">CONFIGURAÇÕES DE TELA CRT & VÍDEO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono px-1.5 py-0.5 rounded border border-zinc-800">ESC</span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded border border-zinc-700 bg-zinc-900 hover:border-rose-400 hover:text-rose-400 text-zinc-400 flex items-center justify-center transition-colors"
                title="Fechar janela (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 overflow-y-auto cyber-scrollbar flex-1 space-y-4">
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
            type="button"
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
            type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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

          {/* Degauss Coil Action Button */}
          {onTriggerDegauss && (
            <div className="p-2 rounded bg-black/60 border border-amber-500/40 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Bobina de Degauss
                </div>
                <div className="text-[9px] text-zinc-500">Desmagnetização com choque e som analógico Web Audio</div>
              </div>
              <button
                type="button"
                disabled={isDegaussing}
                onClick={onTriggerDegauss}
                className={`px-3 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition-all ${
                  isDegaussing
                    ? 'border-amber-400 bg-amber-500/30 text-amber-200 animate-pulse'
                    : 'border-amber-500/70 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{isDegaussing ? 'DISPARANDO...' : 'DEGAUSS'}</span>
              </button>
            </div>
          )}

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
                type="button"
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
                type="button"
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
                  type="button"
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
                type="button"
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
                type="button"
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
                  type="button"
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

          {/* 3. Vignette Intensity Configuration */}
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
                type="button"
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
                type="button"
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
                  type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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

          {/* CRT Screen Jitter / Tremor Level (Strictly On / Off: Leve 15%) */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Activity className={`w-3.5 h-3.5 ${crtConfig.jitter ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
                <span className="text-[10px] uppercase font-bold">Tremor do Tubo (Jitter)</span>
              </div>
              <span className={`text-[10px] font-mono font-bold ${crtConfig.jitter ? 'text-amber-400' : 'text-zinc-500'}`}>
                {crtConfig.jitter ? 'LIGADO (NÍVEL LEVE)' : 'DESLIGADO'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => onCrtConfigChange({ jitter: false, jitterIntensity: 0 })}
                className={`py-2 px-3 rounded border text-center transition-all ${
                  !crtConfig.jitter
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <div className="font-bold text-[11px]">DESLIGADO</div>
                <div className="text-[9px] text-zinc-500">Imagem perfeitamente estável</div>
              </button>
              <button
                type="button"
                onClick={() => onCrtConfigChange({ jitter: true, jitterIntensity: 15 })}
                className={`py-2 px-3 rounded border text-center transition-all ${
                  crtConfig.jitter
                    ? 'border-amber-400 bg-amber-500/25 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <div className="font-bold text-[11px]">LIGADO (LEVE)</div>
                <div className="text-[9px] text-amber-400/80">Oscilação analógica suave (15%)</div>
              </button>
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
                  : `${(crtConfig.cursorBlinkRate ?? 1.4).toFixed(2)}s`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onCrtConfigChange({
                    cursorBlinkRate: Math.max(0, Number(((crtConfig.cursorBlinkRate ?? 1.4) - 0.1).toFixed(2))),
                  })
                }
                title="Acelerar piscada"
                className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-emerald-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={crtConfig.cursorBlinkRate ?? 1.4}
                onChange={(e) =>
                  onCrtConfigChange({ cursorBlinkRate: parseFloat(e.target.value) })
                }
                className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  onCrtConfigChange({
                    cursorBlinkRate: Math.min(2.0, Number(((crtConfig.cursorBlinkRate ?? 1.4) + 0.1).toFixed(2))),
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
                  type="button"
                  key={preset.label}
                  onClick={() => onCrtConfigChange({ cursorBlinkRate: preset.rate })}
                  className={`py-0.5 px-1 rounded text-[9px] font-mono border text-center transition-all ${
                    (crtConfig.cursorBlinkRate ?? 1.4) === preset.rate
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Efeito das Faixas de Hertz / Varredura */}
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
                      hertzSpeed: crtConfig.hertzSpeed ?? 15,
                      hertzWidth: crtConfig.hertzWidth ?? 100,
                      hertzIntensity: crtConfig.hertzIntensity ?? 5,
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

            {/* Velocidade das Faixas */}
            <div className="space-y-1 bg-black/40 p-2 rounded border border-zinc-800/80">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-bold">Velocidade:</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {crtConfig.hertzSpeed ?? 15}% (~{(15 * Math.pow(0.04, (crtConfig.hertzSpeed ?? 15) / 100)).toFixed(1)}s/ciclo)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.max(1, (crtConfig.hertzSpeed ?? 15) - 5);
                    onCrtConfigChange({ hertz: true, hertzSpeed: nextVal });
                  }}
                  title="Diminuir velocidade"
                  className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={crtConfig.hertzSpeed ?? 15}
                  onChange={(e) =>
                    onCrtConfigChange({
                      hertz: true,
                      hertzSpeed: parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.min(100, (crtConfig.hertzSpeed ?? 15) + 5);
                    onCrtConfigChange({ hertz: true, hertzSpeed: nextVal });
                  }}
                  title="Aumentar velocidade"
                  className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Largura das Faixas */}
            <div className="space-y-1 bg-black/40 p-2 rounded border border-zinc-800/80">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-bold">Largura das Faixas:</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {crtConfig.hertzWidth ?? 100}% (~{Math.round(25 + ((crtConfig.hertzWidth ?? 100) / 100) * 395)}px)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.max(5, (crtConfig.hertzWidth ?? 100) - 5);
                    onCrtConfigChange({ hertz: true, hertzWidth: nextVal });
                  }}
                  title="Diminuir largura"
                  className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={crtConfig.hertzWidth ?? 100}
                  onChange={(e) =>
                    onCrtConfigChange({
                      hertz: true,
                      hertzWidth: parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.min(100, (crtConfig.hertzWidth ?? 100) + 5);
                    onCrtConfigChange({ hertz: true, hertzWidth: nextVal });
                  }}
                  title="Aumentar largura"
                  className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Opacidade das Faixas */}
            <div className="space-y-1 bg-black/40 p-2 rounded border border-zinc-800/80">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-bold">Transparência:</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {crtConfig.hertzIntensity ?? 5}% ({(crtConfig.hertzIntensity ?? 5) <= 10 ? 'Ultra Suave' : 'Visível'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.max(0, (crtConfig.hertzIntensity ?? 5) - 5);
                    onCrtConfigChange({ hertz: nextVal > 0, hertzIntensity: nextVal });
                  }}
                  title="Tornar faixas mais suaves"
                  className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={crtConfig.hertzIntensity ?? 5}
                  onChange={(e) =>
                    onCrtConfigChange({
                      hertz: true,
                      hertzIntensity: parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.min(100, (crtConfig.hertzIntensity ?? 5) + 5);
                    onCrtConfigChange({ hertz: true, hertzIntensity: nextVal });
                  }}
                  title="Aumentar intensidade"
                  className="w-6 h-6 rounded border border-zinc-800 bg-zinc-900 hover:border-cyan-400 text-zinc-300 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-1 border-t border-zinc-900 text-zinc-300 text-[11px]">
            {/* Grade de Fósforo */}
            <label className="flex items-center justify-between cursor-pointer">
              <span>Grade de Fósforo (Aperture Grille)</span>
              <input
                type="checkbox"
                checked={crtConfig.scanlines}
                onChange={(e) => onCrtConfigChange({ scanlines: e.target.checked })}
                className="accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Phosphor Persistence (Ghosting) Toggle */}
            <div className="pt-2 border-t border-zinc-900/80 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Ghost
                    className={`w-3.5 h-3.5 ${
                      crtConfig.mode === 'real' && crtConfig.phosphorGhosting
                        ? 'text-emerald-400 animate-pulse'
                        : 'text-zinc-500'
                    }`}
                  />
                  <span className="text-[10px] uppercase font-bold">Phosphor Persistence (Ghosting)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={crtConfig.mode !== 'real'}
                    onClick={() => {
                      if (crtConfig.mode === 'real') {
                        onCrtConfigChange({ phosphorGhosting: !crtConfig.phosphorGhosting });
                      }
                    }}
                    title={
                      crtConfig.mode !== 'real'
                        ? 'Efeito exclusivo do modo CRT Real. Ative o CRT Real para habilitar o Ghosting.'
                        : crtConfig.phosphorGhosting
                        ? 'Desligar efeito de persistência de fósforo'
                        : 'Ligar efeito de persistência de fósforo'
                    }
                    className={`text-[9px] px-2 py-0.5 rounded border font-bold transition-all ${
                      crtConfig.mode !== 'real'
                        ? 'border-zinc-800/60 bg-zinc-950 text-zinc-600 cursor-not-allowed opacity-50'
                        : crtConfig.phosphorGhosting
                        ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300 shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {crtConfig.mode !== 'real' ? 'BLOQUEADO' : crtConfig.phosphorGhosting ? 'LIGADO' : 'OFF'}
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-zinc-500 leading-tight">
                {crtConfig.mode === 'real'
                  ? 'Simula a dissipação analógica dos elétrons: caracteres antigos demoram ~450ms para sumir em afterglow suave.'
                  : '⚠ Disponível apenas com o filtro CRT Real ativado. Nos modos Leve e Off, o efeito permanece desligado.'}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Typography Section */
        <div className="space-y-3">
          {/* 1. Font Family */}
          <div className="space-y-1">
            <span className="text-zinc-400 text-[10px] uppercase font-bold">1. Família da Fonte</span>
            <div className="space-y-1">
              {FONTS.map((f) => {
                const isSelected = typographyConfig.family === f.id;
                return (
                  <button
                    type="button"
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
                    type="button"
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
                    type="button"
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

      {/* Quick Command Hints Bar */}
      <div className="text-[10px] text-zinc-500 italic text-center pt-2 border-t border-zinc-900 shrink-0">
        Comandos de terminal: <span className="text-emerald-400 font-bold">degauss</span> • <span className="text-cyan-400 font-bold">split</span> • <span className="text-amber-400 font-bold">jitter on/off</span> • <span className="text-emerald-400 font-bold">brightness 120</span> • <span className="text-cyan-400 font-bold">curve 100</span>
      </div>
    </div>

    {/* Centralized Modal Action Footer */}
    <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
      <button
        type="button"
        onClick={() => {
          onCrtConfigChange({
            brightness: 120,
            curvature: true,
            curvatureIntensity: 100,
            vignetteIntensity: 35,
            bloom: 'normal',
            jitter: false,
            jitterIntensity: 0,
            cursorBlinkRate: 1.4,
            hertz: true,
            hertzSpeed: 15,
            hertzWidth: 100,
            hertzIntensity: 5,
            scanlines: false,
            phosphorGhosting: true,
          });
        }}
        className="px-3 py-1 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold transition-colors"
      >
        RESTAURAR PADRÕES RECOMENDADOS
      </button>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1 rounded border border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold shadow-[0_0_10px_rgba(0,255,102,0.3)] transition-all ml-auto"
        >
          CONCLUÍDO [ESC]
        </button>
      )}
    </div>
  </div>
</div>
  );
};

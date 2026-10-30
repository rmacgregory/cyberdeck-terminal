import React from 'react';
import {
  CornerDownLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  RotateCcw,
} from 'lucide-react';

interface MobileAccessoryBarProps {
  onInsertChar: (char: string) => void;
  onTab: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onArrowLeft: () => void;
  onArrowRight: () => void;
  onEscape: () => void;
  onCtrlC: () => void;
  onCtrlL: () => void;
  onEnter: () => void;
  onClose?: () => void;
}

export const MobileAccessoryBar: React.FC<MobileAccessoryBarProps> = ({
  onInsertChar,
  onTab,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEscape,
  onCtrlC,
  onCtrlL,
  onEnter,
  onClose,
}) => {
  return (
    <div className="w-full bg-[#030605]/95 border-t border-zinc-800 px-2 py-1.5 flex items-center justify-between gap-1 select-none backdrop-blur-md z-30 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.6)]">
      {/* Scrollable Key Rail */}
      <div className="flex items-center gap-1.5 overflow-x-auto cyber-scrollbar flex-1 py-0.5 pr-1 touch-pan-x">
        {/* ESC Key */}
        <button
          type="button"
          onClick={onEscape}
          className="h-8 px-2.5 rounded bg-zinc-900 border border-zinc-700/80 active:bg-zinc-700 active:border-emerald-400 text-zinc-300 font-mono text-xs font-bold shrink-0 transition-colors cursor-pointer"
        >
          ESC
        </button>

        {/* TAB Key */}
        <button
          type="button"
          onClick={onTab}
          className="h-8 px-2.5 rounded bg-zinc-900 border border-emerald-500/40 active:bg-emerald-950 active:border-emerald-400 text-emerald-300 font-mono text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
          title="Autocompletar comando ([TAB])"
        >
          TAB ⇥
        </button>

        {/* CTRL+C Interrupt */}
        <button
          type="button"
          onClick={onCtrlC}
          className="h-8 px-2.5 rounded bg-zinc-900 border border-amber-500/40 active:bg-amber-950 active:border-amber-400 text-amber-300 font-mono text-xs font-bold shrink-0 transition-colors cursor-pointer"
          title="Interromper (^C)"
        >
          ^C
        </button>

        {/* CTRL+L Clear */}
        <button
          type="button"
          onClick={onCtrlL}
          className="h-8 px-2 rounded bg-zinc-900 border border-zinc-700/80 active:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold shrink-0 transition-colors cursor-pointer"
          title="Limpar tela (^L)"
        >
          ^L
        </button>

        {/* Directional Navigation Keys (Crucial for mobile keyboards!) */}
        <div className="flex items-center bg-black/60 rounded border border-zinc-800 p-0.5 shrink-0 gap-0.5">
          <button
            type="button"
            onClick={onArrowUp}
            className="w-8 h-7 flex items-center justify-center rounded bg-zinc-900 active:bg-emerald-900 text-zinc-300 active:text-emerald-300 transition-colors cursor-pointer"
            title="Histórico Anterior (Seta Cima)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onArrowDown}
            className="w-8 h-7 flex items-center justify-center rounded bg-zinc-900 active:bg-emerald-900 text-zinc-300 active:text-emerald-300 transition-colors cursor-pointer"
            title="Histórico Próximo (Seta Baixo)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onArrowLeft}
            className="w-8 h-7 flex items-center justify-center rounded bg-zinc-900 active:bg-cyan-900 text-zinc-300 active:text-cyan-300 transition-colors cursor-pointer"
            title="Mover cursor à esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onArrowRight}
            className="w-8 h-7 flex items-center justify-center rounded bg-zinc-900 active:bg-cyan-900 text-zinc-300 active:text-cyan-300 transition-colors cursor-pointer"
            title="Mover cursor à direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Unix / Terminal Operator Characters */}
        {['|', '/', '-', '~', '\\', '.', ':', '"'].map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => onInsertChar(char)}
            className="h-8 min-w-[30px] px-2 rounded bg-zinc-900/90 border border-zinc-800 active:bg-zinc-700 active:border-emerald-500 text-zinc-200 font-mono text-sm font-bold shrink-0 transition-colors cursor-pointer"
          >
            {char}
          </button>
        ))}

        {/* Enter Key */}
        <button
          type="button"
          onClick={onEnter}
          className="h-8 px-3 rounded bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-400 text-black font-mono text-xs font-bold shrink-0 transition-all shadow-[0_0_10px_rgba(16,185,129,0.4)] flex items-center gap-1 cursor-pointer"
          title="Executar comando (ENTER)"
        >
          <span>ENTER</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dismiss / Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 active:bg-zinc-800 transition-colors shrink-0"
          title="Ocultar barra de teclas auxiliares"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

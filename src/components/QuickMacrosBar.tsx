import React from 'react';
import {
  Radio,
  Network,
  ShieldAlert,
  Route,
  Activity,
  FileCode,
  Download,
  Trash2,
  Copy,
  Split,
} from 'lucide-react';

interface QuickMacrosBarProps {
  onExecuteCommand: (cmd: string) => void;
  onOpenHtop: () => void;
  onOpenNano: (filename: string) => void;
  onExportLog: () => void;
  isSplitScreen: boolean;
  isBroadcastMode: boolean;
  onToggleBroadcast: () => void;
  onToggleSplitLayout: () => void;
  splitOrientation: 'vertical' | 'horizontal';
}

export const QuickMacrosBar: React.FC<QuickMacrosBarProps> = ({
  onExecuteCommand,
  onOpenHtop,
  onOpenNano,
  onExportLog,
  isSplitScreen,
  isBroadcastMode,
  onToggleBroadcast,
  onToggleSplitLayout,
  splitOrientation,
}) => {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 border border-zinc-800/80 rounded font-mono text-[10px] overflow-x-auto cyber-scrollbar shrink-0 select-none">
      <span className="text-zinc-500 font-bold px-1 flex items-center gap-1 shrink-0">
        <Radio className="w-3 h-3 text-cyan-400" />
        MACROS:
      </span>

      {/* Ping Gateway */}
      <button
        onClick={() => onExecuteCommand('ping 192.168.1.1')}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Ping no gateway padrão (192.168.1.1)"
      >
        <Network className="w-3 h-3 text-emerald-400" />
        PING GW
      </button>

      {/* Ping-Sweep */}
      <button
        onClick={() => onExecuteCommand('ping-sweep 192.168.1.0/24')}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Varredura ICMP em toda sub-rede /24"
      >
        <Network className="w-3 h-3 text-cyan-400" />
        SCAN /24
      </button>

      {/* Port Scanner */}
      <button
        onClick={() => onExecuteCommand('nmap 192.168.1.1')}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Varredura de portas abertas (nmap / scanport)"
      >
        <ShieldAlert className="w-3 h-3 text-amber-400" />
        PORT SCAN
      </button>

      {/* Traceroute */}
      <button
        onClick={() => onExecuteCommand('traceroute 8.8.8.8')}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-purple-500/50 text-zinc-300 hover:text-purple-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Rastrear saltos de rede até destino"
      >
        <Route className="w-3 h-3 text-purple-400" />
        TRACEROUTE
      </button>

      {/* Htop Process Monitor */}
      <button
        onClick={onOpenHtop}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Abrir monitor de processos HTOP"
      >
        <Activity className="w-3 h-3 text-emerald-400" />
        HTOP
      </button>

      {/* Nano Text Editor */}
      <button
        onClick={() => onOpenNano('notas.txt')}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Abrir editor de texto GNU nano"
      >
        <FileCode className="w-3 h-3 text-cyan-400" />
        NANO NOTAS
      </button>

      {/* Export Session Log */}
      <button
        onClick={onExportLog}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Baixar histórico do terminal em arquivo .log"
      >
        <Download className="w-3 h-3 text-cyan-400" />
        EXPORTAR LOG
      </button>

      {/* Clear Terminal */}
      <button
        onClick={() => onExecuteCommand('clear')}
        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-rose-500/50 text-zinc-300 hover:text-rose-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        title="Limpar tela atual (clear)"
      >
        <Trash2 className="w-3 h-3 text-rose-400" />
        CLEAR
      </button>

      {/* Split Screen options */}
      {isSplitScreen && (
        <>
          <span className="text-zinc-600">|</span>
          <button
            onClick={onToggleBroadcast}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 transition-colors cursor-pointer font-bold ${
              isBroadcastMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
            title="Sincronizar digitação em ambos os terminais simultaneamente"
          >
            <Copy className="w-3 h-3" />
            {isBroadcastMode ? 'SYNC ON' : 'SYNC OFF'}
          </button>

          <button
            onClick={onToggleSplitLayout}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            title="Alternar orientação do split (Vertical / Horizontal)"
          >
            <Split className="w-3 h-3 text-cyan-400" />
            {splitOrientation === 'vertical' ? 'SPLIT [||]' : 'SPLIT [=]'}
          </button>
        </>
      )}
    </div>
  );
};

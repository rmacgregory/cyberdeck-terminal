import React, { useState, useRef, useEffect } from 'react';
import { ConnectionLog, LogLevel } from '../types';
import { Activity, Trash2, ArrowDownCircle, Shield, Wifi } from 'lucide-react';

interface ConnectionLogsPanelProps {
  logs: ConnectionLog[];
  onClear: () => void;
}

export const ConnectionLogsPanel: React.FC<ConnectionLogsPanelProps> = ({ logs, onClear }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'CONNECT') return log.level === 'CONNECT' || log.level === 'SUCCESS';
    if (filter === 'DATA') return log.level === 'DATA' || log.level === 'INFO';
    if (filter === 'ERR') return log.level === 'ERR' || log.level === 'WARN';
    return true;
  });

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'CONNECT':
        return <span className="px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 font-bold text-[9px]">CONN</span>;
      case 'SUCCESS':
        return <span className="px-1 py-0.2 rounded bg-green-950/80 text-green-300 border border-green-500/50 font-bold text-[9px]">OK</span>;
      case 'DATA':
        return <span className="px-1 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 font-bold text-[9px]">DATA</span>;
      case 'WARN':
        return <span className="px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50 font-bold text-[9px]">WARN</span>;
      case 'ERR':
        return <span className="px-1 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 font-bold text-[9px]">ERR</span>;
      case 'INFO':
      default:
        return <span className="px-1 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700 font-bold text-[9px]">INFO</span>;
    }
  };

  return (
    <div className="border crt-glow-box p-3 rounded bg-black/60 text-xs flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>LOG DE CONEXÃO // TEMPO REAL</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Pausar auto-scroll' : 'Ativar auto-scroll'}
            className={`p-1 rounded border transition-colors ${
              autoScroll ? 'border-emerald-500/60 text-emerald-400 bg-emerald-950/30' : 'border-zinc-800 text-zinc-500'
            }`}
          >
            <ArrowDownCircle className="w-3 h-3" />
          </button>
          <button
            onClick={onClear}
            title="Limpar logs"
            className="p-1 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-2 text-[10px] font-mono">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-2 py-0.5 rounded border transition-colors ${
            filter === 'ALL'
              ? 'border-current bg-white/10 font-bold'
              : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          TODOS ({logs.length})
        </button>
        <button
          onClick={() => setFilter('CONNECT')}
          className={`px-2 py-0.5 rounded border transition-colors ${
            filter === 'CONNECT'
              ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30 font-bold'
              : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          CONEXÃO
        </button>
        <button
          onClick={() => setFilter('DATA')}
          className={`px-2 py-0.5 rounded border transition-colors ${
            filter === 'DATA'
              ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30 font-bold'
              : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          DADOS
        </button>
        <button
          onClick={() => setFilter('ERR')}
          className={`px-2 py-0.5 rounded border transition-colors ${
            filter === 'ERR'
              ? 'border-rose-500 text-rose-300 bg-rose-950/30 font-bold'
              : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ERROS
        </button>
      </div>

      {/* Log Feed */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto space-y-1.5 cyber-scrollbar pr-1 font-mono text-[10px] min-h-[140px]"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 p-4">
            <Wifi className="w-6 h-6 mb-1 opacity-40" />
            <span>Nenhum log registrado ainda</span>
            <span className="text-[9px] opacity-60">Inicie um comando (ssh, telnet, ping, etc.) para ver os eventos ao vivo</span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-1 rounded bg-black/40 border border-zinc-900/90 hover:border-zinc-800 transition-colors flex items-start gap-1.5 leading-tight"
            >
              <span className="text-zinc-500 shrink-0 font-mono text-[9px]">{log.timestamp}</span>
              <div className="shrink-0">{getLevelBadge(log.level)}</div>
              <div className="flex-1 min-w-0 break-words">
                <span className="font-semibold text-zinc-300 mr-1">[{log.protocol}]</span>
                <span className="text-zinc-200">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 pt-1 border-t border-zinc-900 text-[9px] text-zinc-500 flex justify-between">
        <span>STATUS: MONITOR ATIVO</span>
        <span>EVENTS: {logs.length}</span>
      </div>
    </div>
  );
};

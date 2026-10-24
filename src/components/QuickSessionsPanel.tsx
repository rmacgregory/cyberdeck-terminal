import React from 'react';
import { QuickSession } from '../types';
import { Layers, Plus, Trash2, Play, Terminal } from 'lucide-react';

interface QuickSessionsPanelProps {
  sessions: QuickSession[];
  onSelectSession: (session: QuickSession) => void;
  onOpenAddModal: () => void;
  onDeleteSession: (id: string) => void;
}

export const QuickSessionsPanel: React.FC<QuickSessionsPanelProps> = ({
  sessions,
  onSelectSession,
  onOpenAddModal,
  onDeleteSession,
}) => {
  const getProtocolBadge = (proto: string) => {
    switch (proto) {
      case 'SSH':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30';
      case 'TELNET':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
      case 'PING':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
      case 'SCAN':
        return 'text-purple-400 border-purple-500/40 bg-purple-950/30';
      default:
        return 'text-zinc-400 border-zinc-700 bg-zinc-900';
    }
  };

  return (
    <div className="border crt-glow-box p-3 rounded bg-black/60 text-xs flex flex-col gap-2.5">
      <div className="font-bold border-b border-zinc-800 pb-1.5 flex items-center justify-between text-xs tracking-wider">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 opacity-70" />
          <span>SESSÕES RÁPIDAS</span>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-2 py-0.5 rounded border border-current hover:bg-emerald-950/40 crt-glow-box text-[10px] font-bold flex items-center gap-1 transition-colors"
          title="Cadastrar Host, IP e Protocolo"
        >
          <Plus className="w-3 h-3" />
          <span>+ Adicionar</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto cyber-scrollbar pr-1">
        {sessions.length === 0 ? (
          <div className="p-3 text-center border border-dashed border-zinc-800/80 rounded text-[11px] text-zinc-500 flex flex-col items-center gap-1">
            <Terminal className="w-4 h-4 opacity-40 text-emerald-400" />
            <span>Nenhum acesso rápido salvo</span>
            <span className="text-[10px] opacity-70">
              Clique em <strong className="text-zinc-300">[+ Adicionar]</strong> acima para salvar HOST, IP e PROTOCOLO.
            </span>
          </div>
        ) : (
          sessions.map((item) => (
            <div
              key={item.id}
              className="group p-2 rounded border border-zinc-800/90 hover:border-current hover:bg-emerald-950/30 transition-all flex items-center justify-between gap-2"
            >
              <button
                onClick={() => onSelectSession(item)}
                className="flex-1 text-left flex flex-col min-w-0"
                title={`Iniciar conexão ${item.protocol} em ${item.ip}`}
              >
                <div className="flex items-center gap-1.5 font-bold truncate">
                  <span className={`px-1 py-0.2 rounded border text-[9px] font-mono ${getProtocolBadge(item.protocol)}`}>
                    {item.protocol}
                  </span>
                  <span className="truncate text-zinc-100">{item.name}</span>
                </div>
                <div className="text-[10px] opacity-60 font-mono truncate mt-0.5">
                  {item.ip}
                  {item.port ? `:${item.port}` : ''} {item.user ? `(${item.user})` : ''}
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onSelectSession(item)}
                  className="p-1 rounded text-emerald-400 hover:bg-emerald-900/50 transition-colors"
                  title="Conectar no terminal"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
                <button
                  onClick={() => onDeleteSession(item.id)}
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Remover sessão"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

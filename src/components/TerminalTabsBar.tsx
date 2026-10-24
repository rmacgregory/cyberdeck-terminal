import React, { useState } from 'react';
import { TerminalTab, TerminalTheme } from '../types';
import { Plus, X, Terminal, Radio, Server, Edit2, Check } from 'lucide-react';

interface TerminalTabsBarProps {
  tabs: TerminalTab[];
  activeTabId: string;
  theme: TerminalTheme;
  onSelectTab: (id: string) => void;
  onNewTab: (title?: string) => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, newTitle: string) => void;
}

export const TerminalTabsBar: React.FC<TerminalTabsBarProps> = ({
  tabs,
  activeTabId,
  theme,
  onSelectTab,
  onNewTab,
  onCloseTab,
  onRenameTab,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  const handleStartRename = (tab: TerminalTab, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditTitle(tab.title);
  };

  const handleSaveRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRenameTab(id, trimmed);
    }
    setEditingTabId(null);
  };

  const handleKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  const getProtocolColor = (proto: TerminalTab['protocol']) => {
    switch (proto) {
      case 'SSH':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
      case 'TELNET':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      case 'PING':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'RAW':
        return 'text-purple-400 border-purple-500/40 bg-purple-950/40';
      default:
        return 'text-emerald-400 border-emerald-500/30 bg-black/40';
    }
  };

  const getThemeTabStyles = (isActive: boolean) => {
    if (!isActive) {
      return 'bg-black/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-700';
    }

    switch (theme) {
      case 'amber':
        return 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(255,176,0,0.25)]';
      case 'cyan':
        return 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.25)]';
      case 'magenta':
        return 'bg-pink-950/40 border-pink-500 text-pink-200 shadow-[0_0_12px_rgba(255,0,119,0.25)]';
      default:
        return 'bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(0,255,102,0.25)]';
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 border-b border-zinc-800 text-xs overflow-x-auto cyber-scrollbar select-none">
      {/* Abas Abertas */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingTabId === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onDoubleClick={(e) => handleStartRename(tab, e)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t border-t-2 border-x border-b-0 cursor-pointer transition-all duration-150 shrink-0 max-w-xs ${getThemeTabStyles(
                isActive
              )}`}
              title={`${tab.title} (${tab.protocol}) - Dois cliques para renomear`}
            >
              {/* Badge do Protocolo */}
              <span
                className={`px-1 py-0.2 rounded border text-[9px] font-mono tracking-tight font-bold ${getProtocolColor(
                  tab.protocol
                )}`}
              >
                {tab.protocol}
              </span>

              {/* Status do Backend / Equipamento */}
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  tab.sessionState === 'remote_session'
                    ? 'bg-cyan-400 animate-pulse'
                    : tab.backendConnected
                    ? 'bg-emerald-400'
                    : 'bg-zinc-600'
                }`}
                title={
                  tab.sessionState === 'remote_session'
                    ? 'Sessão remota ativa'
                    : tab.backendConnected
                    ? 'Conectado ao backend local'
                    : 'Desconectado / Offline'
                }
              />

              {/* Título ou Campo de Edição */}
              {isEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(tab.id, e)}
                    onBlur={() => handleSaveRename(tab.id)}
                    autoFocus
                    className="w-24 px-1 py-0.5 bg-black border border-current text-[11px] font-mono focus:outline-none rounded"
                  />
                  <button
                    onClick={() => handleSaveRename(tab.id)}
                    className="text-emerald-400 hover:text-emerald-300"
                    title="Confirmar"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="truncate font-mono text-[11px] font-medium tracking-wide">
                  {tab.title}
                </span>
              )}

              {/* Indicador de novidades em segundo plano */}
              {tab.hasUnread && !isActive && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-400 animate-ping"
                  title="Novas mensagens recebidas nesta aba"
                />
              )}

              {/* Botões de Ação na Aba (Renomear e Fechar) */}
              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity ml-1">
                {!isEditing && (
                  <button
                    onClick={(e) => handleStartRename(tab, e)}
                    className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Renomear aba"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                )}

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-0.5 rounded hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Fechar aba"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Linha indicadora inferior para aba ativa */}
              {isActive && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-black" />
              )}
            </div>
          );
        })}
      </div>

      {/* Botão Nova Aba */}
      <button
        onClick={() => onNewTab()}
        className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-800 hover:border-current hover:bg-emerald-950/30 text-zinc-400 hover:text-current transition-all shrink-0 font-mono text-[11px]"
        title="Abrir nova aba de conexão (Alt+T ou comando 'tab new')"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Nova Aba</span>
      </button>
    </div>
  );
};

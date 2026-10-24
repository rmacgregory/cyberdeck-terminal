import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ExternalLink,
  ShieldCheck,
  X,
  Maximize2,
  Minimize2,
  Search,
  Bookmark,
  Terminal,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { TerminalTheme, CrtConfig } from '../types';

interface IntegratedBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  theme: TerminalTheme;
  crtConfig: CrtConfig;
  initialUrl?: string;
  onRunTerminalCommand?: (command: string) => void;
}

interface QuickBookmark {
  name: string;
  url: string;
  desc: string;
  icon: string;
}

const QUICK_BOOKMARKS: QuickBookmark[] = [
  {
    name: 'Cyber Portal BBS',
    url: 'cyberdeck://home',
    desc: 'Portal interno Cyberdeck & Matriz',
    icon: '⚡'
  },
  {
    name: 'Wikipedia (Mobile)',
    url: 'https://en.m.wikipedia.org',
    desc: 'Enciclopédia livre com suporte a iframe',
    icon: '🌐'
  },
  {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com',
    desc: 'Mecanismo de busca anônimo',
    icon: '🦆'
  },
  {
    name: 'Internet Archive',
    url: 'https://archive.org',
    desc: 'Biblioteca digital da história da web',
    icon: '💾'
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    desc: 'Notícias de tecnologia e computação',
    icon: '👾'
  },
  {
    name: 'W3C Web Standards',
    url: 'https://www.w3.org',
    desc: 'Especificações originais da World Wide Web',
    icon: '📜'
  }
];

export const IntegratedBrowser: React.FC<IntegratedBrowserProps> = ({
  isOpen,
  onClose,
  theme,
  crtConfig,
  initialUrl = 'cyberdeck://home',
  onRunTerminalCommand,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Sync initial URL if passed
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

  if (!isOpen) return null;

  const resolveUrl = (url: string): string => {
    let target = url.trim();
    if (!target) return '';

    if (target.startsWith('cyberdeck://')) {
      return target;
    }

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        // Search query
        target = `https://duckduckgo.com/?q=${encodeURIComponent(target)}`;
      }
    }

    // Auto-conversão de links do YouTube para formato Embed (compatível com iframe e CRT)
    try {
      if (target.includes('youtube.com/watch') || target.includes('youtu.be/')) {
        let videoId = '';
        if (target.includes('youtu.be/')) {
          const match = target.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
          if (match) videoId = match[1];
        } else if (target.includes('v=')) {
          const match = target.match(/[?&]v=([a-zA-Z0-9_-]+)/);
          if (match) videoId = match[1];
        }
        if (videoId) {
          return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
        }
      }
    } catch {
      // Ignore
    }

    return target;
  };

  const navigateTo = (rawUrl: string) => {
    const target = resolveUrl(rawUrl);
    if (!target) return;

    setIsLoading(true);
    setCurrentUrl(target);
    setInputUrl(target);

    // Update history
    const nextHistory = [...history.slice(0, historyIndex + 1), target];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(prev);
      setInputUrl(prev);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(next);
      setInputUrl(next);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current && currentUrl !== 'cyberdeck://home') {
      iframeRef.current.src = currentUrl;
    } else {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigateTo(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  return (
    <div
      className={`fixed inset-0 z-50 p-2 sm:p-4 flex flex-col justify-center items-center backdrop-blur-sm bg-black/60 transition-all ${
        isMaximized ? 'p-0' : ''
      }`}
    >
      {/* Outer Cyber Window Container */}
      <div
        className={`w-full flex flex-col bg-zinc-950 border border-current crt-glow-box shadow-[0_0_40px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-200 ${
          isMaximized
            ? 'h-full rounded-none'
            : 'h-[92vh] max-w-6xl rounded-lg border-2'
        }`}
      >
        {/* Browser Top Window Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-current/30 bg-black/80 text-xs font-mono select-none shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-current animate-pulse" />
            <span className="font-bold tracking-widest uppercase">
              CYBER-NET BROWSER // NEURAL LINK v2.4
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-current/40 opacity-75">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              CRT FILTER SYNCED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[10px] opacity-60">
              {crtConfig.mode === 'real'
                ? 'TUBO CRT ATIVO'
                : crtConfig.mode === 'subtle'
                ? 'CRT LEVE'
                : 'FLAT'}
            </span>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restaurar janela' : 'Maximizar'}
              className="p-1 rounded hover:bg-white/10 text-current transition-colors"
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              title="Fechar Navegador (ESC)"
              className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 border-b border-current/20 bg-zinc-900/60 text-xs font-mono shrink-0">
          {/* History & Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleBack}
              disabled={historyIndex <= 0}
              title="Voltar"
              className="p-1.5 rounded border border-current/30 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
              title="Avançar"
              className="p-1.5 rounded border border-current/30 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReload}
              title="Recarregar página"
              className="p-1.5 rounded border border-current/30 hover:bg-white/10 transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigateTo('cyberdeck://home')}
              title="Página Inicial Cyberdeck"
              className="p-1.5 rounded border border-current/30 hover:bg-white/10 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Input Form */}
          <form
            onSubmit={handleUrlSubmit}
            className="flex-1 min-w-[200px] flex items-center gap-1.5 bg-black/80 border border-current/40 rounded px-2.5 py-1 text-xs"
          >
            <span className="text-[10px] opacity-60">URL:</span>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Digite um link (ex: https://en.m.wikipedia.org) ou termo de busca..."
              className="flex-1 bg-transparent text-current focus:outline-none text-xs font-mono"
            />
            <button
              type="submit"
              title="Navegar"
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-current/40 text-[10px] font-bold uppercase transition-colors"
            >
              IR
            </button>
          </form>

          {/* Direct external opener if needed */}
          {currentUrl.startsWith('http') && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir em nova aba externa do sistema"
              className="px-2 py-1.5 rounded border border-current/30 hover:bg-white/10 text-[10px] flex items-center gap-1 opacity-75 hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">ABA EXTERNA</span>
            </a>
          )}
        </div>

        {/* Quick Bookmarks Bar */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-current/15 bg-black/40 text-[11px] overflow-x-auto whitespace-nowrap scrollbar-thin select-none shrink-0">
          <span className="text-[10px] opacity-50 flex items-center gap-1 mr-1">
            <Bookmark className="w-3 h-3" />
            FAVORITOS:
          </span>
          {QUICK_BOOKMARKS.map((bm) => (
            <button
              key={bm.name}
              onClick={() => navigateTo(bm.url)}
              title={bm.desc}
              className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 transition-all ${
                currentUrl === bm.url
                  ? 'border-current bg-white/15 font-bold shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                  : 'border-current/20 hover:border-current/50 hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <span>{bm.icon}</span>
              <span>{bm.name}</span>
            </button>
          ))}
        </div>

        {/* Loading Bar Indicator */}
        {isLoading && (
          <div className="h-0.5 w-full bg-current/20 overflow-hidden shrink-0">
            <div className="h-full bg-current animate-pulse w-full"></div>
          </div>
        )}

        {/* Browser Content Area */}
        <div className="flex-1 min-h-0 relative bg-black flex flex-col overflow-hidden">
          {currentUrl === 'cyberdeck://home' ? (
            /* Built-in Cyberdeck Matrix Portal / BBS */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-mono text-xs space-y-6">
              {/* Hero Banner */}
              <div className="p-4 rounded border border-current/30 bg-black/60 space-y-3">
                <div className="flex items-center justify-between border-b border-current/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-current animate-pulse" />
                    <span className="text-sm font-bold tracking-widest uppercase">
                      CYBERDECK MATRIX HUB // PORTAL WEB CRT
                    </span>
                  </div>
                  <span className="text-[10px] opacity-60">
                    SISTEMA: ONLINE • PORTA 80/443
                  </span>
                </div>

                <p className="text-sm opacity-90 leading-relaxed">
                  Bem-vindo ao navegador integrado com renderização através do tubo catódico retro CRT.
                  Todo o conteúdo navegável abaixo herda os efeitos de curvatura esférica, linhas de varredura
                  (scanlines), grade de fósforo e brilho (bloom) configurados no sistema.
                </p>

                {/* Cyber Web Search */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 pt-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-60" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar na Web ou na Wikipedia..."
                      className="w-full bg-zinc-900 border border-current/40 rounded pl-9 pr-3 py-2 text-xs text-current focus:outline-none focus:border-current"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded border border-current bg-white/10 hover:bg-white/20 font-bold uppercase transition-colors"
                  >
                    BUSCAR
                  </button>
                </form>
              </div>

              {/* Grid: Popular Portals & Feeds */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1: Wikipedia */}
                <div className="p-3.5 rounded border border-current/25 bg-zinc-950/80 space-y-2 hover:border-current/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      🌐 Wikipedia Mobile
                    </span>
                    <span className="text-[10px] opacity-50">100% IFRAME OK</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    Acesso completo a milhões de artigos sobre ciência, computação, história e cibernética.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => navigateTo('https://en.m.wikipedia.org')}
                      className="px-2.5 py-1 rounded border border-current bg-white/10 hover:bg-white/20 text-[10px] font-bold"
                    >
                      ABRIR WIKIPEDIA
                    </button>
                    <button
                      onClick={() => navigateTo('https://pt.m.wikipedia.org')}
                      className="px-2 py-1 rounded border border-current/40 hover:bg-white/10 text-[10px]"
                    >
                      VERSÃO PT
                    </button>
                  </div>
                </div>

                {/* Card 2: DuckDuckGo */}
                <div className="p-3.5 rounded border border-current/25 bg-zinc-950/80 space-y-2 hover:border-current/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      🦆 DuckDuckGo Search
                    </span>
                    <span className="text-[10px] opacity-50">BUSCA ANÔNIMA</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    Mecanismo de pesquisa rápida sem rastreamento de dados de rede.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigateTo('https://duckduckgo.com')}
                      className="px-2.5 py-1 rounded border border-current bg-white/10 hover:bg-white/20 text-[10px] font-bold"
                    >
                      ABRIR BUSCADOR
                    </button>
                  </div>
                </div>

                {/* Card 3: Internet Archive */}
                <div className="p-3.5 rounded border border-current/25 bg-zinc-950/80 space-y-2 hover:border-current/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      💾 Internet Archive
                    </span>
                    <span className="text-[10px] opacity-50">WAYBACK MACHINE</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    Exploração de softwares antigos, páginas web dos anos 90 e manuais técnicos de hardware.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigateTo('https://archive.org')}
                      className="px-2.5 py-1 rounded border border-current bg-white/10 hover:bg-white/20 text-[10px] font-bold"
                    >
                      EXPLORAR ARQUIVO
                    </button>
                  </div>
                </div>

                {/* Card 4: Hacker News */}
                <div className="p-3.5 rounded border border-current/25 bg-zinc-950/80 space-y-2 hover:border-current/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      👾 Y Combinator Hacker News
                    </span>
                    <span className="text-[10px] opacity-50">DISCUSSÕES</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    Discussões sobre arquitetura de sistemas, inteligência artificial e hacking.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigateTo('https://news.ycombinator.com')}
                      className="px-2.5 py-1 rounded border border-current bg-white/10 hover:bg-white/20 text-[10px] font-bold"
                    >
                      ABRIR NOTÍCIAS
                    </button>
                  </div>
                </div>

                {/* Card 5: W3C Specifications */}
                <div className="p-3.5 rounded border border-current/25 bg-zinc-950/80 space-y-2 hover:border-current/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      📜 W3C Standards
                    </span>
                    <span className="text-[10px] opacity-50">ORIGENS DA WEB</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    Documentação clássica e especificações fundamentais de HTTP e HTML criadas por Tim Berners-Lee.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigateTo('https://www.w3.org')}
                      className="px-2.5 py-1 rounded border border-current bg-white/10 hover:bg-white/20 text-[10px] font-bold"
                    >
                      ABRIR W3C
                    </button>
                  </div>
                </div>

                {/* Card 6: Terminal Direct Commands */}
                <div className="p-3.5 rounded border border-current/25 bg-zinc-950/80 space-y-2 hover:border-current/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Integração com Terminal
                    </span>
                    <span className="text-[10px] opacity-50">COMANDOS CLI</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    Você pode abrir o navegador diretamente do terminal usando comandos como <code className="text-emerald-400">browser</code> ou <code className="text-emerald-400">surf &lt;url&gt;</code>.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        if (onRunTerminalCommand) onRunTerminalCommand('matrix');
                      }}
                      className="px-2 py-1 rounded border border-current/40 hover:bg-white/10 text-[10px]"
                    >
                      EXECUTAR MATRIX
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        if (onRunTerminalCommand) onRunTerminalCommand('help');
                      }}
                      className="px-2 py-1 rounded border border-current/40 hover:bg-white/10 text-[10px]"
                    >
                      VER HELP
                    </button>
                  </div>
                </div>
              </div>

              {/* Informative Security Notice regarding X-Frame-Options in Modern Browsers */}
              <div className="p-3 rounded border border-amber-500/30 bg-amber-950/20 text-amber-300 text-[11px] flex items-start gap-2.5">
                <span className="text-base leading-none">⚠️</span>
                <div>
                  <span className="font-bold uppercase tracking-wider block">
                    Nota de Protocolo de Segurança Web:
                  </span>
                  Certos servidores (como Google, GitHub ou YouTube) enviam cabeçalhos de segurança
                  (<code className="font-mono text-white">X-Frame-Options: SAMEORIGIN</code>) que bloqueiam a exibição dentro de iframes. Sites abertos como Wikipedia, W3C, Archive.org e feeds suportam navegação direta integrada perfeitamente! Caso encontre uma página restrita, utilize o botão <strong className="text-white">ABA EXTERNA</strong> na barra de ferramentas.
                </div>
              </div>
            </div>
          ) : (
            /* Live Embedded IFrame Browser */
            <div className="flex-1 w-full h-full relative bg-white/5 flex flex-col">
              <iframe
                ref={iframeRef}
                src={currentUrl}
                title="Cyberdeck Integrated Web Browser"
                className="w-full flex-1 border-0 bg-zinc-900"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setIsLoading(false)}
              />

              {/* Bottom Quick Status Bar */}
              <div className="px-3 py-1 bg-black/90 border-t border-current/20 flex items-center justify-between text-[10px] font-mono opacity-70">
                <div className="truncate max-w-[70%]">
                  LINK ATIVO: <span className="text-current font-bold">{currentUrl}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>FILTRO CRT: ATIVO</span>
                  <button
                    onClick={() => navigateTo('cyberdeck://home')}
                    className="underline hover:text-white"
                  >
                    Voltar ao Portal BBS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

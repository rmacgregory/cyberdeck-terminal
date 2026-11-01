import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  X,
  Terminal,
  Activity,
  Layers,
  Network,
  Split,
  Copy,
  Radio,
  FileCode,
  ShieldAlert,
  Route,
  Zap,
  Globe,
  Monitor,
  Trash2,
  Download,
  Cpu,
  Battery,
  Sliders,
  Type,
  Eye,
  CornerDownLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { TerminalTheme } from '../types';

export interface CommandItem {
  id: string;
  command: string;
  title: string;
  description: string;
  category: 'rede' | 'sessao' | 'crt' | 'util' | 'shell' | 'sistema';
  icon: React.ReactNode;
  shortcut?: string;
  argsPlaceholder?: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (cmd: string) => void;
  theme?: TerminalTheme;
}

export const COMMAND_REGISTRY: CommandItem[] = [
  // --- REDE & DIAGNÓSTICO ---
  {
    id: 'ping-sweep',
    command: 'ping-sweep 192.168.1.0/24',
    title: 'ping-sweep <sub-rede/CIDR>',
    description: 'Varredura ICMP em toda a sub-rede para descobrir dispositivos ativos e endereços MAC',
    category: 'rede',
    icon: <Network className="w-4 h-4 text-cyan-400" />,
    argsPlaceholder: '192.168.1.0/24',
  },
  {
    id: 'topology',
    command: 'topology',
    title: 'topology / map',
    description: 'Abrir mapa interativo de topologia de rede D3.js com gráfico de forças e conexões',
    category: 'rede',
    icon: <Network className="w-4 h-4 text-emerald-400 animate-pulse" />,
    shortcut: 'HUD > MAPA D3',
  },
  {
    id: 'ping',
    command: 'ping 192.168.1.1',
    title: 'ping <host>',
    description: 'Disparar sondas de conectividade ICMP e medir latência em milissegundos',
    category: 'rede',
    icon: <Radio className="w-4 h-4 text-emerald-400" />,
    argsPlaceholder: '192.168.1.1',
  },
  {
    id: 'nmap',
    command: 'nmap 192.168.1.1',
    title: 'nmap / scanport <host>',
    description: 'Varredura TCP Stealth das portas de serviços (SSH, Telnet, HTTP, MySQL, PostgreSQL)',
    category: 'rede',
    icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
    argsPlaceholder: '192.168.1.1',
  },
  {
    id: 'traceroute',
    command: 'traceroute 8.8.8.8',
    title: 'traceroute / tracert <ip>',
    description: 'Rastrear saltos de roteadores, gateways intermediários e RTT até o destino',
    category: 'rede',
    icon: <Route className="w-4 h-4 text-purple-400" />,
    argsPlaceholder: '8.8.8.8',
  },
  {
    id: 'ssh',
    command: 'ssh admin@192.168.1.1',
    title: 'ssh [-i chave.pem] [user@]host [-p porta]',
    description: 'Iniciar sessão remota criptografada via protocolo SSH com senha ou chave privada',
    category: 'rede',
    icon: <Terminal className="w-4 h-4 text-cyan-400" />,
    argsPlaceholder: 'admin@192.168.1.1',
  },
  {
    id: 'telnet',
    command: 'telnet 192.168.1.2 23',
    title: 'telnet <host> [porta]',
    description: 'Conexão direta de socket TCP Telnet (RFC 854) para switches e roteadores legados',
    category: 'rede',
    icon: <Terminal className="w-4 h-4 text-amber-400" />,
    argsPlaceholder: '192.168.1.2 23',
  },
  {
    id: 'ipconfig',
    command: 'ipconfig',
    title: 'ipconfig / ifconfig',
    description: 'Exibir detalhes dos adaptadores de rede, IP local, máscara de sub-rede e gateway',
    category: 'rede',
    icon: <Network className="w-4 h-4 text-blue-400" />,
  },

  // --- SESSÃO, ABAS & MULTI-PAINEL ---
  {
    id: 'tab-new',
    command: 'tab new',
    title: 'tab new [nome]',
    description: 'Abrir uma nova aba de console independente para conexões simultâneas',
    category: 'sessao',
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
    shortcut: 'Alt + T',
  },
  {
    id: 'tab-close',
    command: 'tab close',
    title: 'tab close',
    description: 'Fechar a aba ativa de terminal atual',
    category: 'sessao',
    icon: <X className="w-4 h-4 text-rose-400" />,
    shortcut: 'Alt + W',
  },
  {
    id: 'tab-list',
    command: 'tabs',
    title: 'tabs / tab list',
    description: 'Listar todas as abas abertas, protocolos ativos e status de conexão',
    category: 'sessao',
    icon: <Layers className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'split',
    command: 'split',
    title: 'split [-h | -v]',
    description: 'Dividir a tela do Cyberdeck (lado a lado na vertical ou cima/baixo na horizontal)',
    category: 'sessao',
    icon: <Split className="w-4 h-4 text-cyan-400" />,
    shortcut: 'HUD > SPLIT',
  },
  {
    id: 'broadcast',
    command: 'broadcast on',
    title: 'broadcast [on | off]',
    description: 'Sincronizar comandos digitados em ambos os terminais divididos simultaneamente',
    category: 'sessao',
    icon: <Copy className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'sidebar',
    command: 'sidebar',
    title: 'sidebar',
    description: 'Recolher ou expandir os painéis laterais (Sessões e Logs) para maximizar a tela',
    category: 'sessao',
    icon: <Layers className="w-4 h-4 text-zinc-400" />,
    shortcut: 'Alt + B',
  },
  {
    id: 'macros',
    command: 'macros',
    title: 'macros',
    description: 'Exibir ou ocultar a barra de atalhos rápidos de rede, ferramentas e edição',
    category: 'sessao',
    icon: <Radio className="w-4 h-4 text-cyan-400" />,
  },

  // --- UTILITÁRIOS & SISTEMA ---
  {
    id: 'htop',
    command: 'htop',
    title: 'htop / top',
    description: 'Abrir monitor de processos interativo com leitura de CPU multinúcleo e memória RAM',
    category: 'util',
    icon: <Activity className="w-4 h-4 text-emerald-400" />,
    shortcut: 'Macros > HTOP',
  },
  {
    id: 'nano',
    command: 'nano notas.txt',
    title: 'nano / edit <arquivo>',
    description: 'Editor de texto retrô estilo GNU nano no sistema de arquivos virtual (VFS)',
    category: 'util',
    icon: <FileCode className="w-4 h-4 text-cyan-400" />,
    argsPlaceholder: 'notas.txt',
  },
  {
    id: 'cat',
    command: 'cat notas.txt',
    title: 'cat / type <arquivo>',
    description: 'Imprimir conteúdo de um arquivo de texto diretamente no buffer do terminal',
    category: 'util',
    icon: <Eye className="w-4 h-4 text-zinc-300" />,
    argsPlaceholder: 'notas.txt',
  },
  {
    id: 'dir',
    command: 'dir',
    title: 'dir / ls',
    description: 'Listar arquivos e diretórios da pasta de trabalho atual ou Cyberdeck VFS',
    category: 'util',
    icon: <FileCode className="w-4 h-4 text-zinc-400" />,
  },
  {
    id: 'clear',
    command: 'clear',
    title: 'clear / cls',
    description: 'Limpar todos os registros e linhas de saída da aba de console ativa',
    category: 'util',
    icon: <Trash2 className="w-4 h-4 text-rose-400" />,
  },
  {
    id: 'export',
    command: 'export',
    title: 'export / savelog',
    description: 'Fazer o download de todo o histórico da sessão ativa em um arquivo .log estruturado',
    category: 'util',
    icon: <Download className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'systeminfo',
    command: 'systeminfo',
    title: 'systeminfo',
    description: 'Exibir arquitetura de 64-bit, SO, núcleos de CPU, RAM e status do backend',
    category: 'sistema',
    icon: <Cpu className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'battery',
    command: 'battery',
    title: 'battery / power',
    description: 'Exibir telemetria de alimentação, nível de carga percentual e status de recarga AC',
    category: 'sistema',
    icon: <Battery className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'browser',
    command: 'browser cyberdeck://home',
    title: 'browser / web <url>',
    description: 'Abrir o navegador integrado Cyber-Net (Alpha) com visualização CRT',
    category: 'util',
    icon: <Globe className="w-4 h-4 text-emerald-400" />,
  },

  // --- VISUAL & SISTEMA CRT ---
  {
    id: 'crt-real',
    command: 'crt real',
    title: 'crt real',
    description: 'Ativar modo tubo catódico realista com curvatura esférica, bloom e scanlines',
    category: 'crt',
    icon: <Monitor className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'crt-subtle',
    command: 'crt leve',
    title: 'crt leve',
    description: 'Ativar modo de scanlines sutis e planas sem distorção esférica',
    category: 'crt',
    icon: <Monitor className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'crt-off',
    command: 'crt off',
    title: 'crt off',
    description: 'Desativar todos os filtros de tubo para uma tela plana de alta nitidez',
    category: 'crt',
    icon: <Monitor className="w-4 h-4 text-zinc-500" />,
  },
  {
    id: 'degauss',
    command: 'degauss',
    title: 'degauss / desmagnetizar',
    description: 'Disparar choque analógico na bobina catódica CRT para desmagnetização óptica',
    category: 'crt',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    shortcut: 'HUD > DEGAUSS',
  },
  {
    id: 'theme-green',
    command: 'theme green',
    title: 'theme green',
    description: 'Mudar a paleta de fósforo para Verde Matrix clássico (#00ff66)',
    category: 'crt',
    icon: <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 inline-block shrink-0" />,
  },
  {
    id: 'theme-amber',
    command: 'theme amber',
    title: 'theme amber',
    description: 'Mudar a paleta de fósforo para Âmbar CRT industrial (#ffb000)',
    category: 'crt',
    icon: <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block shrink-0" />,
  },
  {
    id: 'theme-cyan',
    command: 'theme cyan',
    title: 'theme cyan',
    description: 'Mudar a paleta de fósforo para Azul Ciano Ciberpunk (#00f0ff)',
    category: 'crt',
    icon: <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 inline-block shrink-0" />,
  },
  {
    id: 'theme-white',
    command: 'theme white',
    title: 'theme white',
    description: 'Mudar a paleta de fósforo para Branco Monocromático Paper White (#f0f4f8)',
    category: 'crt',
    icon: <span className="w-3.5 h-3.5 rounded-full bg-slate-100 inline-block shrink-0" />,
  },
  {
    id: 'theme-red',
    command: 'theme red',
    title: 'theme red',
    description: 'Mudar a paleta de fósforo para Vermelho Tático Militar (#ff2a3b)',
    category: 'crt',
    icon: <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block shrink-0" />,
  },
  {
    id: 'theme-magenta',
    command: 'theme magenta',
    title: 'theme magenta',
    description: 'Mudar a paleta de fósforo para Rosa Synthwave Retrô (#ff0077)',
    category: 'crt',
    icon: <span className="w-3.5 h-3.5 rounded-full bg-pink-500 inline-block shrink-0" />,
  },
  {
    id: 'ghost',
    command: 'ghost on',
    title: 'ghost [on | off]',
    description: 'Ativar persistência de fósforo (Phosphor Persistence Ghosting) no modo CRT Real',
    category: 'crt',
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'hertz',
    command: 'hertz 60hz',
    title: 'hertz <vel> [largura]',
    description: 'Ajustar as faixas de varredura analógica de 50Hz/60Hz e velocidade do feixe',
    category: 'crt',
    icon: <Sliders className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'jitter',
    command: 'jitter on',
    title: 'jitter [on | off]',
    description: 'Ativar o tremor analógico leve do canhão de elétrons na tela',
    category: 'crt',
    icon: <Activity className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'curve',
    command: 'curve 50',
    title: 'curve <0-100|off>',
    description: 'Ajustar a intensidade da curvatura geométrica esférica do tubo CRT',
    category: 'crt',
    icon: <Sliders className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'brightness',
    command: 'brightness 120',
    title: 'brightness <70-200>',
    description: 'Ajustar o brilho e luminescência geral do fósforo catódico',
    category: 'crt',
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
  },
  {
    id: 'font-family',
    command: 'font share-tech',
    title: 'font <share-tech | vt323 | fira-code | jetbrains>',
    description: 'Alterar a tipografia do terminal entre 4 fontes monoespacadas retrô',
    category: 'crt',
    icon: <Type className="w-4 h-4 text-cyan-400" />,
  },

  // --- INTERPRETADORES SHELL ---
  {
    id: 'pwsh',
    command: 'powershell',
    title: 'powershell / pwsh',
    description: 'Alternar interpretador de comandos para o Windows PowerShell',
    category: 'shell',
    icon: <Terminal className="w-4 h-4 text-blue-400" />,
  },
  {
    id: 'cmd',
    command: 'cmd',
    title: 'cmd',
    description: 'Alternar interpretador de comandos para o Prompt de Comando (CMD.EXE)',
    category: 'shell',
    icon: <Terminal className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 'bash',
    command: 'bash',
    title: 'bash',
    description: 'Alternar interpretador de comandos para GNU Bash (/bin/bash)',
    category: 'shell',
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'zsh',
    command: 'zsh',
    title: 'zsh',
    description: 'Alternar interpretador de comandos para Z Shell (/bin/zsh)',
    category: 'shell',
    icon: <Terminal className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'sh',
    command: 'sh',
    title: 'sh',
    description: 'Alternar interpretador de comandos para POSIX Sh nativo Unix / Android',
    category: 'shell',
    icon: <Terminal className="w-4 h-4 text-zinc-400" />,
  },
  {
    id: 'help',
    command: 'help',
    title: 'help / ajuda',
    description: 'Imprimir o manual completo de instruções, atalhos de hardware e comandos',
    category: 'sistema',
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
  },
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
  theme = 'green',
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedCategory('all');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COMMAND_REGISTRY.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        item.command.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [search, selectedCategory]);

  // Clamp selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length, selectedCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]') as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation within the command palette
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecute(filteredCommands[selectedIndex]);
      } else if (search.trim()) {
        // If user typed a custom command directly
        onExecuteCommand(search.trim());
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleExecute = (cmdItem: CommandItem) => {
    onExecuteCommand(cmdItem.command);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#030605] border border-cyan-500/60 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-zinc-100 font-mono">
        {/* Top Header & Search Input Box */}
        <div className="p-3 bg-black/90 border-b border-zinc-800 flex items-center gap-2.5 relative">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
            <Command className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite um comando ou pesquise (ex: ping-sweep, htop, crt, split)..."
            className="flex-1 bg-transparent text-sm font-bold text-white placeholder-zinc-500 focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-zinc-500 hover:text-zinc-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-900 border border-zinc-700 text-zinc-400 shrink-0">
            ESC para sair
          </span>
        </div>

        {/* Categories Bar */}
        <div className="px-3 py-1.5 bg-black/60 border-b border-zinc-800/80 flex items-center gap-1 overflow-x-auto cyber-scrollbar text-[10px]">
          {[
            { id: 'all', label: 'TODOS OS COMANDOS' },
            { id: 'rede', label: 'REDE & PING' },
            { id: 'sessao', label: 'ABAS & SPLIT' },
            { id: 'util', label: 'UTILITÁRIOS' },
            { id: 'crt', label: 'VISUAL CRT' },
            { id: 'shell', label: 'SHELL' },
            { id: 'sistema', label: 'SISTEMA' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-0.5 rounded border transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-bold'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-zinc-500 text-[9px] shrink-0 hidden sm:inline">
            {filteredCommands.length} COMANDOS
          </span>
        </div>

        {/* Results List View */}
        <div
          ref={listRef}
          className="max-h-[58vh] overflow-y-auto cyber-scrollbar divide-y divide-zinc-900 p-1"
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-selected={isSelected}
                  onClick={() => handleExecute(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded shrink-0 border ${
                        isSelected
                          ? 'bg-cyan-900/40 border-cyan-400/60'
                          : 'bg-zinc-900/80 border-zinc-800'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold font-mono tracking-wide ${
                            isSelected ? 'text-cyan-300' : 'text-zinc-200'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[8.5px] uppercase font-mono tracking-wider bg-black/60 border border-zinc-800 text-zinc-500">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-900 border border-zinc-700/80 text-zinc-400">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500 text-black flex items-center gap-1 shadow-sm">
                        <span>EXECUTAR</span>
                        <CornerDownLeft className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-zinc-500 font-mono text-xs space-y-1">
              <p>Nenhum comando encontrado para "{search}".</p>
              <p className="text-[10px] text-zinc-600">
                Pressione Enter para executar "{search}" diretamente no terminal.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <footer className="px-3 py-2 bg-black/90 border-t border-zinc-800 text-[10px] text-zinc-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-300">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-300">
                ↓
              </kbd>{' '}
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-300">
                Enter
              </kbd>{' '}
              Executar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-300">
                Ctrl+Shift+P
              </kbd>{' '}
              Alternar Paleta
            </span>
          </div>

          <div className="text-[9px] text-cyan-400 font-bold">
            CYBERDECK COMMAND PALETTE // QUICK EXEC
          </div>
        </footer>
      </div>
    </div>
  );
};

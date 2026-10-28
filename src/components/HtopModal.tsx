import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Trash2, Cpu, HardDrive, Search, Activity } from 'lucide-react';
import { SystemMetrics } from '../types';

interface ProcessItem {
  pid: number;
  user: string;
  pri: number;
  ni: number;
  virt: string;
  res: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1, user: 'root', pri: 20, ni: 0, virt: '168M', res: '11M', cpu: 0.1, mem: 0.2, time: '0:04.12', command: '/sbin/init splash' },
  { pid: 142, user: 'root', pri: 20, ni: 0, virt: '84M', res: '8.4M', cpu: 0.0, mem: 0.1, time: '0:01.05', command: '/lib/systemd/systemd-journald' },
  { pid: 320, user: 'root', pri: 20, ni: 0, virt: '42M', res: '5.2M', cpu: 0.2, mem: 0.1, time: '0:02.18', command: '/usr/sbin/sshd -D' },
  { pid: 485, user: 'cyber', pri: 20, ni: 0, virt: '980M', res: '142M', cpu: 4.8, mem: 2.1, time: '0:38.45', command: 'node server-terminal.js --pty' },
  { pid: 612, user: 'cyber', pri: 20, ni: 0, virt: '640M', res: '92M', cpu: 1.5, mem: 1.4, time: '0:19.20', command: 'vite --port=3000 --host=0.0.0.0' },
  { pid: 820, user: 'root', pri: 20, ni: 0, virt: '210M', res: '28M', cpu: 0.8, mem: 0.5, time: '0:06.33', command: 'nginx: master process /usr/sbin/nginx' },
  { pid: 821, user: 'www-data', pri: 20, ni: 0, virt: '215M', res: '34M', cpu: 1.2, mem: 0.6, time: '0:12.80', command: 'nginx: worker process' },
  { pid: 1045, user: 'postgres', pri: 20, ni: 0, virt: '480M', res: '64M', cpu: 0.6, mem: 1.0, time: '0:08.15', command: 'postgres: checkpointer' },
  { pid: 1240, user: 'cyber', pri: 20, ni: 0, virt: '88M', res: '18M', cpu: 2.4, mem: 0.3, time: '0:03.42', command: 'htop --cyberdeck' },
];

interface HtopModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemMetrics: SystemMetrics;
}

export const HtopModal: React.FC<HtopModalProps> = ({ isOpen, onClose, systemMetrics }) => {
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [filter, setFilter] = useState('');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'cpu' | 'mem' | 'pid'>('cpu');

  // Simulated live fluctuating core loads and memory
  const [coreLoads, setCoreLoads] = useState<number[]>([35, 48, 22, 60]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCoreLoads([
        Math.min(100, Math.max(5, Math.floor(Math.random() * 40 + 20))),
        Math.min(100, Math.max(5, Math.floor(Math.random() * 50 + 25))),
        Math.min(100, Math.max(5, Math.floor(Math.random() * 35 + 15))),
        Math.min(100, Math.max(5, Math.floor(Math.random() * 60 + 30))),
      ]);

      setProcesses((prev) =>
        prev.map((p) => {
          if (p.pid === 485 || p.pid === 612 || p.pid === 1240) {
            return {
              ...p,
              cpu: Math.max(0.1, Number((p.cpu + (Math.random() * 1.4 - 0.7)).toFixed(1))),
            };
          }
          return p;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key.toLowerCase() === 'q' && !(e.target instanceof HTMLInputElement))) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const killSelectedProcess = () => {
    if (!selectedPid) return;
    setProcesses((prev) => prev.filter((p) => p.pid !== selectedPid));
    setSelectedPid(null);
  };

  const filteredProcesses = processes
    .filter((p) => p.command.toLowerCase().includes(filter.toLowerCase()) || p.user.includes(filter) || String(p.pid).includes(filter))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const renderMeter = (label: string, percent: number, detailText: string) => {
    const totalBars = 20;
    const filledBars = Math.round((percent / 100) * totalBars);
    const barsStr = '|'.repeat(filledBars) + ' '.repeat(totalBars - filledBars);

    return (
      <div className="flex items-center gap-2 font-mono text-[11px] leading-tight">
        <span className="w-14 text-zinc-400 font-bold shrink-0">{label}:</span>
        <span className="text-zinc-600">[</span>
        <span className="text-emerald-400 font-bold tracking-tighter whitespace-pre">{barsStr}</span>
        <span className="text-zinc-600">]</span>
        <span className="text-zinc-300 font-mono text-[10px] ml-1">{detailText}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950/95 border-2 border-emerald-500/80 rounded-lg shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>HTOP - MONITOR DE PROCESSOS & CPU // CYBERDECK CORE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Fechar monitor (ESC / Q)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* System Meters HUD */}
        <div className="p-3 bg-black/60 border-b border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
          {/* Left: CPU Cores */}
          <div className="space-y-1">
            {coreLoads.map((load, idx) => (
              <div key={idx}>
                {renderMeter(`CPU [${idx}]`, load, `${load}%`)}
              </div>
            ))}
          </div>

          {/* Right: Memory & Uptime */}
          <div className="space-y-1">
            {renderMeter(
              'Memória',
              systemMetrics.ramPercent || 38,
              `${(systemMetrics.ramUsedMb / 1024 || 5.8).toFixed(2)}G / ${(systemMetrics.ramTotalMb / 1024 || 16.0).toFixed(1)}G`
            )}
            {renderMeter('Swap', 12, '512M / 4.00G')}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
              <span>Tarefas: <strong className="text-white">{processes.length}</strong>, 2 ativas</span>
              <span>Load: <strong className="text-emerald-400">0.45 0.58 0.62</strong></span>
              <span>Uptime: <strong className="text-cyan-300">4d 14h 22m</strong></span>
            </div>
          </div>
        </div>

        {/* Process Filter & Controls */}
        <div className="px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Filtrar processos..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black/60 border border-zinc-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-emerald-400 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px]">Ordenar:</span>
            <button
              onClick={() => setSortBy('cpu')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                sortBy === 'cpu' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-zinc-400'
              }`}
            >
              %CPU
            </button>
            <button
              onClick={() => setSortBy('mem')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                sortBy === 'mem' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-zinc-400'
              }`}
            >
              %MEM
            </button>
            <button
              onClick={() => setSortBy('pid')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                sortBy === 'pid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-zinc-400'
              }`}
            >
              PID
            </button>
            {selectedPid && (
              <button
                onClick={killSelectedProcess}
                className="px-2 py-0.5 rounded text-[10px] bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:bg-rose-900 flex items-center gap-1 font-bold"
              >
                <Trash2 className="w-3 h-3" />
                Matar (PID {selectedPid})
              </button>
            )}
          </div>
        </div>

        {/* Process Table */}
        <div className="flex-1 overflow-y-auto cyber-scrollbar font-mono text-[11px] select-text">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-zinc-900 text-zinc-400 text-left border-b border-zinc-800">
              <tr>
                <th className="py-1 px-3 w-16">PID</th>
                <th className="py-1 px-2 w-20">USUÁRIO</th>
                <th className="py-1 px-2 w-12">PRI</th>
                <th className="py-1 px-2 w-12">NI</th>
                <th className="py-1 px-2 w-16">VIRT</th>
                <th className="py-1 px-2 w-16">RES</th>
                <th className="py-1 px-2 w-14">%CPU</th>
                <th className="py-1 px-2 w-14">%MEM</th>
                <th className="py-1 px-2 w-20">TEMPO+</th>
                <th className="py-1 px-3">COMANDO</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((proc) => {
                const isSelected = proc.pid === selectedPid;
                return (
                  <tr
                    key={proc.pid}
                    onClick={() => setSelectedPid(proc.pid)}
                    className={`cursor-pointer transition-colors border-b border-zinc-900/60 ${
                      isSelected
                        ? 'bg-emerald-950/80 text-emerald-300 font-bold'
                        : 'text-zinc-300 hover:bg-zinc-900/50'
                    }`}
                  >
                    <td className="py-0.5 px-3 font-semibold text-cyan-400">{proc.pid}</td>
                    <td className="py-0.5 px-2 text-zinc-400">{proc.user}</td>
                    <td className="py-0.5 px-2 text-zinc-500">{proc.pri}</td>
                    <td className="py-0.5 px-2 text-zinc-500">{proc.ni}</td>
                    <td className="py-0.5 px-2 text-zinc-400">{proc.virt}</td>
                    <td className="py-0.5 px-2 text-zinc-400">{proc.res}</td>
                    <td className={`py-0.5 px-2 font-bold ${proc.cpu > 2 ? 'text-amber-300' : 'text-emerald-400'}`}>
                      {proc.cpu.toFixed(1)}
                    </td>
                    <td className="py-0.5 px-2 text-zinc-300">{proc.mem.toFixed(1)}</td>
                    <td className="py-0.5 px-2 text-zinc-400">{proc.time}</td>
                    <td className="py-0.5 px-3 truncate max-w-xs text-white">{proc.command}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Status / Key Hints */}
        <div className="px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-3">
            <span><strong className="text-white">Q / ESC:</strong> Sair</span>
            <span><strong className="text-white">Clique na linha:</strong> Selecionar processo</span>
            <span><strong className="text-white">K / Matar:</strong> Enviar SIGTERM</span>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
          >
            VOLTAR AO TERMINAL
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ProtocolType, QuickSession } from '../types';
import { X, Plus, ShieldCheck, Server } from 'lucide-react';

interface QuickSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<QuickSession, 'id' | 'isDefault'>) => void;
}

export const QuickSessionModal: React.FC<QuickSessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [ip, setIp] = useState('');
  const [protocol, setProtocol] = useState<ProtocolType>('SSH');
  const [port, setPort] = useState<string>('22');
  const [user, setUser] = useState('root');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleProtocolChange = (newProto: ProtocolType) => {
    setProtocol(newProto);
    if (newProto === 'SSH') setPort('22');
    else if (newProto === 'TELNET') setPort('23');
    else if (newProto === 'HTTP') setPort('80');
    else if (newProto === 'SCAN' || newProto === 'PING') setPort('');
    else if (newProto === 'RAW') setPort('8080');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe um nome identificador para a sessão');
      return;
    }
    if (!ip.trim() && !host.trim()) {
      setError('Informe o IP ou Hostname de destino');
      return;
    }

    onSave({
      name: name.trim(),
      host: host.trim() || ip.trim(),
      ip: ip.trim() || host.trim(),
      port: port ? parseInt(port, 10) : undefined,
      protocol,
      user: protocol === 'SSH' ? user.trim() || 'root' : undefined,
    });

    // Reset
    setName('');
    setHost('');
    setIp('');
    setProtocol('SSH');
    setPort('22');
    setUser('root');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md border crt-glow-box bg-zinc-950 p-5 rounded-lg text-xs leading-relaxed font-mono shadow-2xl">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-bold crt-glow">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>ADICIONAR ACESSO RÁPIDO</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded bg-rose-950/40 border border-rose-500/50 text-rose-300 text-[11px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
              Nome Identificador / Host:
            </label>
            <input
              type="text"
              required
              placeholder="ex: Switch Core Sala 02 ou Server Web"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
                Endereço IP / Hostname:
              </label>
              <input
                type="text"
                required
                placeholder="ex: 192.168.1.1"
                value={ip}
                onChange={(e) => {
                  setIp(e.target.value);
                  if (!host) setHost(e.target.value);
                }}
                className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current"
              />
            </div>
            <div>
              <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
                Protocolo:
              </label>
              <select
                value={protocol}
                onChange={(e) => handleProtocolChange(e.target.value as ProtocolType)}
                className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current cursor-pointer"
              >
                <option value="SSH">SSH (Porta 22)</option>
                <option value="TELNET">TELNET (Porta 23)</option>
                <option value="PING">PING (ICMP)</option>
                <option value="SCAN">SCAN / NMAP</option>
                <option value="RAW">WEBSOCKET / RAW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
                Porta (Opcional):
              </label>
              <input
                type="number"
                placeholder={protocol === 'SSH' ? '22' : protocol === 'TELNET' ? '23' : 'Automática'}
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current"
              />
            </div>
            {protocol === 'SSH' && (
              <div>
                <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
                  Usuário Inicial:
                </label>
                <input
                  type="text"
                  placeholder="root"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 border border-current rounded font-bold hover:bg-emerald-950/40 crt-glow-box transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Salvar em Acessos Rápidos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

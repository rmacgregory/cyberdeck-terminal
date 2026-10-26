import React, { useState, useRef } from 'react';
import { ProtocolType, QuickSession } from '../types';
import { X, Plus, Key, Lock, Upload, Server, Cpu } from 'lucide-react';

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
  const [authType, setAuthType] = useState<'password' | 'key'>('password');
  const [privateKey, setPrivateKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [deviceType, setDeviceType] = useState<'auto' | 'cisco' | 'mikrotik' | 'huawei' | 'juniper' | 'linux' | 'windows'>('auto');
  const [keyFileName, setKeyFileName] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProtocolChange = (newProto: ProtocolType) => {
    setProtocol(newProto);
    if (newProto === 'SSH') setPort('22');
    else if (newProto === 'TELNET') setPort('23');
    else if (newProto === 'HTTP') setPort('80');
    else if (newProto === 'SCAN' || newProto === 'PING') setPort('');
    else if (newProto === 'RAW') setPort('8080');
  };

  const handleKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setKeyFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPrivateKey(content.trim());
      }
    };
    reader.readAsText(file);
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
    if (protocol === 'SSH' && authType === 'key' && !privateKey.trim()) {
      setError('Cole a chave privada ou carregue um arquivo .pem/.key');
      return;
    }

    onSave({
      name: name.trim(),
      host: host.trim() || ip.trim(),
      ip: ip.trim() || host.trim(),
      port: port ? parseInt(port, 10) : undefined,
      protocol,
      user: protocol === 'SSH' ? user.trim() || 'root' : undefined,
      authType: protocol === 'SSH' ? authType : undefined,
      privateKey: protocol === 'SSH' && authType === 'key' ? privateKey.trim() : undefined,
      passphrase: protocol === 'SSH' && authType === 'key' && passphrase ? passphrase : undefined,
      deviceType,
    });

    // Reset
    setName('');
    setHost('');
    setIp('');
    setProtocol('SSH');
    setPort('22');
    setUser('root');
    setAuthType('password');
    setPrivateKey('');
    setPassphrase('');
    setKeyFileName('');
    setDeviceType('auto');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg border crt-glow-box bg-zinc-950 p-5 rounded-lg text-xs leading-relaxed font-mono shadow-2xl max-h-[90vh] overflow-y-auto cyber-scrollbar">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-bold crt-glow">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>ADICIONAR ACESSO RÁPIDO & EQUIPAMENTO</span>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
              Nome Identificador / Equipamento:
            </label>
            <input
              type="text"
              required
              placeholder="ex: Switch Core Cisco, Roteador MikroTik, Servidor Web AWS"
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
                placeholder="ex: 192.168.1.1 ou router.local"
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
                <option value="SSH">SSH (Porta 22 - Seguro)</option>
                <option value="TELNET">TELNET (Porta 23 - RFC 854)</option>
                <option value="PING">PING (ICMP Latência)</option>
                <option value="SCAN">SCAN / NMAP</option>
                <option value="RAW">WEBSOCKET / RAW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
                Porta:
              </label>
              <input
                type="number"
                placeholder={protocol === 'SSH' ? '22' : protocol === 'TELNET' ? '23' : 'Automática'}
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current"
              />
            </div>
            <div>
              <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Perfil do Equipamento (Tab Completer):
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as any)}
                className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current cursor-pointer"
              >
                <option value="auto">Auto-detectar pelo Prompt/Banner</option>
                <option value="cisco">Cisco IOS (Switch / Router / Catalyst)</option>
                <option value="mikrotik">MikroTik RouterOS (/ip, /interface)</option>
                <option value="huawei">Huawei VRP (display, system-view)</option>
                <option value="juniper">Juniper JunOS (show, set, commit)</option>
                <option value="linux">Servidor Linux / Unix (Bash, Systemd)</option>
                <option value="windows">Servidor Windows (PowerShell / CMD)</option>
              </select>
            </div>
          </div>

          {protocol === 'SSH' && (
            <div className="border border-zinc-800 bg-black/40 rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="uppercase tracking-wider text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  Autenticação SSH:
                </label>
                <div className="flex items-center gap-1 bg-black/70 p-0.5 rounded border border-zinc-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAuthType('password')}
                    className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                      authType === 'password'
                        ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/60'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Senha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType('key')}
                    className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                      authType === 'key'
                        ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/60'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Key className="w-2.5 h-2.5" />
                    <span>Chave (PEM / PUB)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
                  Usuário SSH:
                </label>
                <input
                  type="text"
                  placeholder="admin, root, cisco..."
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current"
                />
              </div>

              {authType === 'key' && (
                <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                      Chave Privada (OpenSSH / RSA / Ed25519 / PEM):
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleKeyFileUpload}
                      className="hidden"
                      accept=".pem,.key,.pub,id_rsa,id_ed25519,*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-emerald-400 text-zinc-300 hover:text-emerald-300 text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{keyFileName ? `Arquivo: ${keyFileName}` : 'Carregar Arquivo (.pem, .key)'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;b3BlbnNzaC1rZXktdjEAAAA...&#10;-----END OPENSSH PRIVATE KEY-----"
                    className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-[10px] font-mono text-emerald-300 outline-none focus:border-emerald-400 resize-none cyber-scrollbar"
                  />

                  <div>
                    <label className="block mb-1 opacity-80 uppercase tracking-wider text-[10px]">
                      Passphrase da Chave (Opcional - se a chave tiver senha):
                    </label>
                    <input
                      type="password"
                      placeholder="Deixe em branco se a chave não tiver senha"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="w-full bg-black/90 border border-zinc-800 rounded px-2.5 py-1.5 text-current outline-none focus:border-current"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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

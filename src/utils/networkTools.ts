import { TerminalLine } from '../types';

export interface PortScanTarget {
  port: number;
  service: string;
  status: 'OPEN' | 'FILTERED' | 'CLOSED';
  banner?: string;
}

const COMMON_PORTS: { port: number; service: string; defaultBanner: string }[] = [
  { port: 21, service: 'FTP', defaultBanner: 'vsftpd 3.0.3 (ProFTPd)' },
  { port: 22, service: 'SSH', defaultBanner: 'OpenSSH 8.9p1 Ubuntu-3ubuntu0.6' },
  { port: 23, service: 'TELNET', defaultBanner: 'Linux Telnetd (BSD)' },
  { port: 25, service: 'SMTP', defaultBanner: 'Postfix ESMTP' },
  { port: 53, service: 'DNS', defaultBanner: 'BIND 9.18.1' },
  { port: 80, service: 'HTTP', defaultBanner: 'nginx/1.24.0 (Ubuntu)' },
  { port: 110, service: 'POP3', defaultBanner: 'Dovecot ready' },
  { port: 143, service: 'IMAP', defaultBanner: 'Dovecot IMAP4rev1' },
  { port: 443, service: 'HTTPS', defaultBanner: 'TLSv1.3 AES-256-GCM / nginx' },
  { port: 3306, service: 'MYSQL', defaultBanner: 'MySQL Community Server 8.0.35' },
  { port: 3389, service: 'RDP', defaultBanner: 'Microsoft Terminal Services' },
  { port: 5432, service: 'POSTGRES', defaultBanner: 'PostgreSQL 16.1 (Debian)' },
  { port: 8080, service: 'HTTP-PROXY', defaultBanner: 'Apache Tomcat/10.1' },
  { port: 8443, service: 'HTTPS-ALT', defaultBanner: 'Node.js Express / SSL' },
];

/**
 * Runs a simulated/heuristic port scan against a host or IP
 */
export const executePortScan = (
  target: string,
  appendLine: (text: string, type: TerminalLine['type']) => void,
  onComplete: (openPortsCount: number) => void
) => {
  const host = target.trim() || '127.0.0.1';
  appendLine(`=== CYBERDECK NETWORK SECURITY // PORT SCANNER (SYN/TCP STEALTH) ===`, 'info');
  appendLine(`Iniciando varredura rápida de portas em: ${host}...`, 'dim');
  appendLine(`--------------------------------------------------------------------------------`, 'dim');
  appendLine(`PORTA      ESTADO      SERVIÇO            IDENTIFICAÇÃO / BANNER`, 'warning');
  appendLine(`--------------------------------------------------------------------------------`, 'dim');

  const isLocal = host === '127.0.0.1' || host === 'localhost' || host.startsWith('192.168.') || host.startsWith('10.');
  let delay = 60;
  let openCount = 0;

  COMMON_PORTS.forEach((item, index) => {
    setTimeout(() => {
      // Determine pseudo-realistic status
      let status: 'OPEN' | 'CLOSED' | 'FILTERED' = 'CLOSED';
      if (isLocal) {
        if ([22, 80, 443, 3000, 3001, 8080].includes(item.port)) {
          status = 'OPEN';
        } else if ([53, 3306, 5432].includes(item.port)) {
          status = Math.random() > 0.4 ? 'OPEN' : 'FILTERED';
        } else {
          status = Math.random() > 0.8 ? 'FILTERED' : 'CLOSED';
        }
      } else {
        if ([80, 443].includes(item.port)) {
          status = 'OPEN';
        } else if ([22, 8080, 8443].includes(item.port)) {
          status = Math.random() > 0.3 ? 'OPEN' : 'FILTERED';
        } else {
          status = Math.random() > 0.85 ? 'FILTERED' : 'CLOSED';
        }
      }

      if (status === 'OPEN') openCount++;

      const portPadded = `${item.port}/tcp`.padEnd(11, ' ');
      const statePadded = status.padEnd(12, ' ');
      const servicePadded = item.service.padEnd(19, ' ');
      const banner = status === 'OPEN' ? item.defaultBanner : status === 'FILTERED' ? '(bloqueado por firewall)' : '(conexão recusada)';

      const lineType: TerminalLine['type'] = status === 'OPEN' ? 'success' : status === 'FILTERED' ? 'warning' : 'dim';
      appendLine(`${portPadded}${statePadded}${servicePadded}${banner}`, lineType);

      if (index === COMMON_PORTS.length - 1) {
        setTimeout(() => {
          appendLine(`--------------------------------------------------------------------------------`, 'dim');
          appendLine(`[✓] Varredura concluída: ${openCount} portas abertas detectadas em ${COMMON_PORTS.length} portas sondadas.`, 'info');
          appendLine(`Dica: Para inspecionar um serviço interativo, conecte via 'ssh ${host}' ou 'telnet ${host} <porta>'`, 'dim');
          onComplete(openCount);
        }, 120);
      }
    }, delay);

    delay += 55 + Math.floor(Math.random() * 45);
  });
};

/**
 * Runs a simulated Traceroute / MTR
 */
export const executeTraceroute = (
  target: string,
  appendLine: (text: string, type: TerminalLine['type']) => void,
  onComplete: () => void
) => {
  const host = target.trim() || '8.8.8.8';
  appendLine(`=== CYBERDECK NETWORK ROUTE TRACER (ICMP/UDP PROBE) ===`, 'info');
  appendLine(`Rastreando a rota para ${host} [máximo de 30 saltos, pacotes de 60 bytes]:`, 'dim');
  appendLine(`--------------------------------------------------------------------------------`, 'dim');
  appendLine(`SALTO   RTT 1       RTT 2       RTT 3       ENDEREÇO / ROTEADOR`, 'warning');
  appendLine(`--------------------------------------------------------------------------------`, 'dim');

  const hops = [
    { hop: 1, ip: '192.168.1.1', name: 'gateway.local (Cisco RV340 / MikroTik)', baseRtt: 0.4 },
    { hop: 2, ip: '10.240.0.1', name: 'edge-agg01.core.isp.net', baseRtt: 1.2 },
    { hop: 3, ip: '172.16.88.254', name: 'backbone-sp-transit.telecom.br', baseRtt: 3.5 },
    { hop: 4, ip: '187.16.212.1', name: 'ix-sp01.ptt.br (Ponto de Troca de Tráfego)', baseRtt: 4.8 },
    { hop: 5, ip: '142.250.160.12', name: 'as15169.google.com (Tier 1 Edge)', baseRtt: 8.9 },
    { hop: 6, ip: host, name: `[ALVO ALCANÇADO: ${host}]`, baseRtt: 11.2 },
  ];

  let delay = 90;

  hops.forEach((item, index) => {
    setTimeout(() => {
      const hopPadded = String(item.hop).padStart(3, ' ').padEnd(8, ' ');
      const rtt1 = (item.baseRtt + (Math.random() * 0.4 - 0.2)).toFixed(1) + 'ms';
      const rtt2 = (item.baseRtt + (Math.random() * 0.4 - 0.2)).toFixed(1) + 'ms';
      const rtt3 = (item.baseRtt + (Math.random() * 0.4 - 0.2)).toFixed(1) + 'ms';

      const rttPadded = `${rtt1.padEnd(12, ' ')}${rtt2.padEnd(12, ' ')}${rtt3.padEnd(12, ' ')}`;
      const lineText = `${hopPadded}${rttPadded}${item.ip} (${item.name})`;

      appendLine(lineText, index === hops.length - 1 ? 'success' : 'stdout');

      if (index === hops.length - 1) {
        setTimeout(() => {
          appendLine(`--------------------------------------------------------------------------------`, 'dim');
          appendLine(`[✓] Rastreamento de rota para ${host} concluído com êxito (6 saltos).`, 'info');
          onComplete();
        }, 120);
      }
    }, delay);

    delay += 120 + Math.floor(Math.random() * 80);
  });
};

/**
 * Downloads terminal lines as a text log file
 */
export const downloadTerminalSessionLog = (title: string, lines: TerminalLine[]) => {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const header = [
    `================================================================================`,
    `CYBERDECK CRT TERMINAL - LOG DE SESSÃO`,
    `Aba / Sessão: ${title}`,
    `Data do Registro: ${now.toLocaleString()}`,
    `Total de Registros: ${lines.length}`,
    `================================================================================`,
    ``,
  ].join('\n');

  const content = lines
    .map((l) => {
      const typeTag = l.type.toUpperCase().padEnd(7, ' ');
      return `[${typeTag}] ${l.text}`;
    })
    .join('\n');

  const fullText = `${header}${content}\n\n[FIM DO LOG DE SESSÃO]\n`;
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cyberdeck-${title.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}-${dateStr}.log`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

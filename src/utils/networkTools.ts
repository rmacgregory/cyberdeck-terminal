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

import { NetworkNode, NetworkLink, PingSweepResult } from '../types';

/**
 * Builds realistic network topology data (nodes & links) from a target subnet
 */
export const generatePingSweepTopology = (subnetStr: string): PingSweepResult => {
  const trimmed = subnetStr.trim() || '192.168.1.0/24';
  let basePrefix = '';
  let cidr = 24;

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    basePrefix = parts[0].trim();
    cidr = parseInt(parts[1], 10) || 24;
  } else {
    basePrefix = trimmed;
  }

  const octets = basePrefix.split('.');
  const o1 = octets[0] || '192';
  const o2 = octets[1] || '168';
  const o3 = octets[2] || '1';
  const prefix = `${o1}.${o2}.${o3}.`;
  const canonicalSubnet = `${prefix}0/${cidr}`;

  const gwIp = `${prefix}1`;
  const switchIp = `${prefix}2`;
  const dnsIp = `${prefix}5`;
  const nasIp = `${prefix}10`;
  const consoleIp = `${prefix}20`;
  const apIp = `${prefix}32`;
  const printerIp = `${prefix}75`;
  const appServerIp = `${prefix}104`;
  const cctvIp = `${prefix}142`;
  const mobileIp = `${prefix}200`;

  const nodes: NetworkNode[] = [
    {
      id: gwIp,
      ip: gwIp,
      rtt: '0.4ms',
      rttMs: 0.4,
      name: 'Gateway Principal (Cisco RV340 / MikroTik)',
      mac: '00:1A:2B:3C:4D:5E',
      type: 'gateway',
      status: 'online',
      role: 'Default Gateway & Edge Firewall',
      services: ['DNS Resolver', 'DHCP Server', 'NAT/BGP', 'SSH', 'HTTPS'],
      ports: [22, 53, 67, 443, 8443],
      subnet: canonicalSubnet,
    },
    {
      id: switchIp,
      ip: switchIp,
      rtt: '0.8ms',
      rttMs: 0.8,
      name: 'Switch Core PoE+ (Ubiquiti UniFi Pro 24)',
      mac: 'B4:FB:E4:3A:89:12',
      type: 'switch',
      status: 'online',
      role: 'L2/L3 Distribution Core Switch',
      services: ['VLAN 10/20/30/99', 'SNMPv3', 'SSH', 'RSTP'],
      ports: [22, 161, 80],
      subnet: canonicalSubnet,
    },
    {
      id: dnsIp,
      ip: dnsIp,
      rtt: '1.2ms',
      rttMs: 1.2,
      name: 'Servidor DNS / Pi-Hole & AdBlock Guard',
      mac: 'DC:A6:32:44:55:66',
      type: 'server',
      status: 'online',
      role: 'Internal DNS & Recursive Resolver',
      services: ['Pi-Hole FTL', 'BIND DNS', 'Lighttpd', 'SSH'],
      ports: [22, 53, 80, 443],
      subnet: canonicalSubnet,
    },
    {
      id: nasIp,
      ip: nasIp,
      rtt: '1.5ms',
      rttMs: 1.5,
      name: 'NAS Armazenamento (Synology DiskStation DS920+)',
      mac: '00:11:32:98:76:54',
      type: 'server',
      status: 'online',
      role: 'RAID 10 Storage, iSCSI & Backup Target',
      services: ['NFSv4', 'Samba SMB3', 'iSCSI Target', 'Docker', 'HTTPS DSM'],
      ports: [22, 111, 445, 2049, 3260, 5001],
      subnet: canonicalSubnet,
    },
    {
      id: consoleIp,
      ip: consoleIp,
      rtt: '0.1ms',
      rttMs: 0.1,
      name: 'Cyberdeck Operator Console [ESTAÇÃO LOCAL ATIVA]',
      mac: '02:42:AC:11:00:02',
      type: 'client',
      status: 'online',
      role: 'Master Cyberdeck Terminal Workstation',
      services: ['WebSocket Hub', 'Terminal Shell (Bash/Pwsh)', 'Vite Dev'],
      ports: [3000, 3001],
      subnet: canonicalSubnet,
    },
    {
      id: apIp,
      ip: apIp,
      rtt: '2.6ms',
      rttMs: 2.6,
      name: 'Ponto de Acesso Wi-Fi 6 (Aruba Instant On AP22)',
      mac: '9C:1C:12:F0:E1:D2',
      type: 'ap',
      status: 'online',
      role: 'WLAN Dual-Band Controller (WPA3-Enterprise)',
      services: ['802.11ax 4x4 MU-MIMO', 'RADIUS Client', 'HTTPS'],
      ports: [443, 1812],
      subnet: canonicalSubnet,
    },
    {
      id: printerIp,
      ip: printerIp,
      rtt: '7.3ms',
      rttMs: 7.3,
      name: 'Impressora Corporativa (HP LaserJet Enterprise P3015)',
      mac: '3C:D9:2B:77:88:99',
      type: 'printer',
      status: 'online',
      role: 'Network Print Server & JetDirect',
      services: ['IPP', 'RAW Port 9100', 'SNMP', 'Web Admin'],
      ports: [80, 443, 631, 9100],
      subnet: canonicalSubnet,
    },
    {
      id: appServerIp,
      ip: appServerIp,
      rtt: '1.8ms',
      rttMs: 1.8,
      name: 'Servidor de Aplicações Linux (Debian 12 / Docker)',
      mac: '52:54:00:12:34:56',
      type: 'server',
      status: 'online',
      role: 'Container Host & PostgreSQL Database',
      services: ['Docker Engine', 'PostgreSQL 16', 'Nginx Reverse Proxy', 'SSH'],
      ports: [22, 80, 443, 5432, 8080],
      subnet: canonicalSubnet,
    },
    {
      id: cctvIp,
      ip: cctvIp,
      rtt: '4.8ms',
      rttMs: 4.8,
      name: 'Câmera IP CFTV RTSP (Hikvision Dome 4K H.265)',
      mac: 'C0:56:E3:A1:B2:C3',
      type: 'camera',
      status: 'online',
      role: 'Surveillance Video Streamer',
      services: ['RTSP Stream', 'ONVIF Profile S/G', 'HTTPS Admin'],
      ports: [80, 554, 8000],
      subnet: canonicalSubnet,
    },
    {
      id: mobileIp,
      ip: mobileIp,
      rtt: '16.2ms',
      rttMs: 16.2,
      name: 'Dispositivo Móvel / Tablet Corporativo (Apple iOS / Android)',
      mac: '70:EC:E4:90:12:34',
      type: 'client',
      status: 'online',
      role: 'Mobile Fleet Endpoint (Wi-Fi 5GHz)',
      services: ['MDM Agent', 'mDNS/Bonjour'],
      ports: [5353],
      subnet: canonicalSubnet,
    },
  ];

  // Interconnection links representing real network topology
  const links: NetworkLink[] = [
    // Uplink between Gateway and Core Switch
    { source: gwIp, target: switchIp, bandwidth: '10 Gbps SFP+ DAC', latency: '0.2ms', linkType: 'uplink' },
    
    // Core infrastructure hooked to switch
    { source: switchIp, target: dnsIp, bandwidth: '1 Gbps Cat6', latency: '0.4ms', linkType: 'ethernet' },
    { source: switchIp, target: nasIp, bandwidth: '2x 1 Gbps LACP', latency: '0.5ms', linkType: 'ethernet' },
    { source: switchIp, target: appServerIp, bandwidth: '10 Gbps SFP+', latency: '0.3ms', linkType: 'fiber' },
    { source: switchIp, target: consoleIp, bandwidth: '1 Gbps Cat6 Direct', latency: '0.1ms', linkType: 'ethernet' },
    { source: switchIp, target: apIp, bandwidth: '2.5 Gbps PoE+ Uplink', latency: '0.6ms', linkType: 'ethernet' },
    { source: switchIp, target: printerIp, bandwidth: '100 Mbps FastEthernet', latency: '1.2ms', linkType: 'ethernet' },
    { source: switchIp, target: cctvIp, bandwidth: '100 Mbps PoE Isolated', latency: '1.4ms', linkType: 'ethernet' },

    // Wireless devices connected to Access Point
    { source: apIp, target: mobileIp, bandwidth: 'Wi-Fi 6 866 Mbps (5GHz)', latency: '3.2ms', linkType: 'wifi' },

    // Cross-service dependencies
    { source: consoleIp, target: appServerIp, bandwidth: 'Intranet TCP Session', latency: '0.2ms', linkType: 'ethernet' },
    { source: appServerIp, target: nasIp, bandwidth: 'NFS Storage Mount', latency: '0.4ms', linkType: 'ethernet' },
  ];

  return {
    subnet: canonicalSubnet,
    timestamp: new Date().toLocaleTimeString(),
    totalScanned: cidr === 24 ? 254 : 64,
    activeCount: nodes.length,
    durationMs: 940,
    nodes,
    links,
  };
};

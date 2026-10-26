import { TerminalTab } from '../types';

export type EquipmentType =
  | 'cisco'
  | 'mikrotik'
  | 'huawei'
  | 'juniper'
  | 'linux'
  | 'windows'
  | 'cyberdeck';

// 1. Dicionário Cisco IOS (Switches, Roteadores, Catalyst)
export const CISCO_COMMANDS: string[] = [
  'show running-config',
  'show startup-config',
  'show ip interface brief',
  'show interfaces',
  'show interfaces status',
  'show version',
  'show vlan brief',
  'show ip route',
  'show mac address-table',
  'show cdp neighbors',
  'show cdp neighbors detail',
  'show arp',
  'show logging',
  'show inventory',
  'show power inline',
  'show running-config interface',
  'show ip protocols',
  'show ip bgp summary',
  'show ip ospf neighbor',
  'show standby brief',
  'show etherchannel summary',
  'show spanning-tree',
  'show tech-support',
  'configure terminal',
  'interface GigabitEthernet',
  'interface FastEthernet',
  'interface TenGigabitEthernet',
  'interface Vlan',
  'interface Port-channel',
  'ip address',
  'no shutdown',
  'shutdown',
  'switchport mode access',
  'switchport access vlan',
  'switchport mode trunk',
  'switchport trunk allowed vlan',
  'spanning-tree portfast',
  'description',
  'ip default-gateway',
  'ip route 0.0.0.0 0.0.0.0',
  'write memory',
  'copy running-config startup-config',
  'terminal length 0',
  'enable',
  'disable',
  'reload',
  'ping',
  'traceroute',
  'exit',
  'end',
];

// 2. Dicionário MikroTik RouterOS
export const MIKROTIK_COMMANDS: string[] = [
  '/ip address print',
  '/ip address add',
  '/ip route print',
  '/ip route add',
  '/ip pool print',
  '/ip dhcp-server print',
  '/ip dhcp-server lease print',
  '/ip firewall filter print',
  '/ip firewall nat print',
  '/ip firewall mangle print',
  '/ip firewall address-list print',
  '/ip dns print',
  '/ip service print',
  '/ip neighbor print',
  '/ip arp print',
  '/interface print',
  '/interface ethernet print',
  '/interface wireless print',
  '/interface bridge print',
  '/interface bridge port print',
  '/interface vlan print',
  '/interface monitor-traffic',
  '/system reboot',
  '/system identity print',
  '/system identity set name=',
  '/system resource print',
  '/system resource cpu print',
  '/system clock print',
  '/system routerboard print',
  '/system health print',
  '/system backup save name=',
  '/tool ping',
  '/tool traceroute',
  '/tool torch',
  '/tool bandwidth-test',
  '/tool profile',
  '/export',
  '/export file=',
  '/ping',
  '/log print',
  '/log print follow',
  '/user print',
  '/quit',
];

// 3. Dicionário Huawei VRP (Datacom / Switches)
export const HUAWEI_COMMANDS: string[] = [
  'display current-configuration',
  'display ip interface brief',
  'display interface brief',
  'display version',
  'display mac-address',
  'display vlan',
  'display arp',
  'display ip routing-table',
  'display device',
  'display logbuffer',
  'display cpu-usage',
  'display memory-usage',
  'display lldp neighbor brief',
  'system-view',
  'interface GigabitEthernet',
  'interface 10GE',
  'interface Eth-Trunk',
  'interface Vlanif',
  'ip address',
  'port link-type access',
  'port default vlan',
  'port link-type trunk',
  'port trunk allow-pass vlan',
  'undo shutdown',
  'shutdown',
  'save',
  'quit',
  'return',
  'reboot',
  'ping',
  'tracert',
];

// 4. Dicionário Juniper JunOS
export const JUNIPER_COMMANDS: string[] = [
  'show interfaces terse',
  'show interfaces extensive',
  'show configuration',
  'show configuration | display set',
  'show route',
  'show route summary',
  'show chassis hardware',
  'show chassis routing-engine',
  'show chassis alarms',
  'show system uptime',
  'show system processes',
  'show arp',
  'show bgp summary',
  'show ospf neighbor',
  'configure',
  'edit interfaces',
  'set interfaces',
  'commit',
  'commit check',
  'rollback',
  'exit',
  'ping',
  'traceroute',
  'restart',
];

// 5. Dicionário Servidor Linux / Bash
export const LINUX_COMMANDS: string[] = [
  'sudo systemctl status',
  'sudo systemctl restart',
  'sudo systemctl start',
  'sudo systemctl stop',
  'sudo journalctl -u',
  'sudo journalctl -xe',
  'sudo ufw status',
  'sudo apt update && sudo apt upgrade',
  'docker ps',
  'docker logs',
  'docker-compose up -d',
  'docker-compose down',
  'ip addr show',
  'ip route show',
  'netstat -tulnp',
  'ss -tulnp',
  'free -h',
  'df -h',
  'uptime',
  'uname -a',
  'top',
  'htop',
  'ps aux | grep',
  'tail -f /var/log/syslog',
  'tail -f /var/log/auth.log',
  'cat /etc/os-release',
  'chmod +x',
  'chown -R',
  'mkdir -p',
  'nano',
  'vim',
  'ping -c 4',
  'curl -I',
  'wget',
  'ssh-keygen',
  'tar -xvf',
  'grep -rn',
  'ls -la',
  'cd',
  'pwd',
  'clear',
  'exit',
];

// 6. Dicionário Servidor Windows / PowerShell
export const WINDOWS_COMMANDS: string[] = [
  'Get-Process',
  'Get-Service',
  'Get-NetIPAddress',
  'Get-NetRoute',
  'Get-NetAdapter',
  'Restart-Service',
  'Start-Service',
  'Stop-Service',
  'Test-NetConnection',
  'ipconfig /all',
  'ipconfig /flushdns',
  'netstat -ano',
  'nslookup',
  'route print',
  'tracert',
  'systeminfo',
  'wmic',
  'tasklist',
  'taskkill /F /PID',
  'dir',
  'cd',
  'mkdir',
  'copy',
  'del',
  'cls',
  'exit',
];

// 7. Comandos Nativos do Cyberdeck Terminal
export const CYBERDECK_COMMANDS: string[] = [
  'tab new',
  'tab close',
  'tab next',
  'tab prev',
  'tab rename',
  'theme green',
  'theme amber',
  'theme cyan',
  'theme magenta',
  'crt real',
  'crt subtle',
  'crt off',
  'crt bloom',
  'crt bezel',
  'crt curve',
  'brightness',
  'curve',
  'vinheta',
  'vignette',
  'jitter 35',
  'jitter off',
  'hertz 50 40',
  'hertz 60hz',
  'hertz drift',
  'hertz off',
  'cursor 0.5s',
  'cursor solid',
  'cursor blink',
  'cursor slow',
  'cursor fast',
  'cursor turbo',
  'font share-tech',
  'font vt323',
  'font fira-code',
  'font jetbrains',
  'browser',
  'youtube',
  'ssh',
  'telnet',
  'ping',
  'backend',
  'reconnect',
  'cls',
  'clear',
  'whoami',
  'systeminfo',
  'exit',
  'help',
];

/**
 * Detecta o tipo de equipamento conectado à aba ativa
 */
export function detectEquipment(tab: TerminalTab): { type: EquipmentType; label: string } {
  // 1. Se foi explicitamente configurado no acesso rápido
  if (tab.deviceType && tab.deviceType !== 'auto') {
    switch (tab.deviceType) {
      case 'cisco':
        return { type: 'cisco', label: 'Cisco IOS / Catalyst' };
      case 'mikrotik':
        return { type: 'mikrotik', label: 'MikroTik RouterOS' };
      case 'huawei':
        return { type: 'huawei', label: 'Huawei VRP' };
      case 'juniper':
        return { type: 'juniper', label: 'Juniper JunOS' };
      case 'linux':
        return { type: 'linux', label: 'Servidor Linux / Bash' };
      case 'windows':
        return { type: 'windows', label: 'Windows PowerShell' };
    }
  }

  // 2. Se estiver em sessão remota (SSH / TELNET)
  if (tab.sessionState === 'remote_session' || tab.protocol === 'SSH' || tab.protocol === 'TELNET') {
    const searchString = [
      tab.title,
      tab.remoteSessionName,
      tab.target,
      ...tab.lines.slice(-30).map((l) => l.text),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (
      searchString.includes('mikrotik') ||
      searchString.includes('routeros') ||
      searchString.includes('[admin@')
    ) {
      return { type: 'mikrotik', label: 'MikroTik RouterOS' };
    }

    if (
      searchString.includes('cisco') ||
      searchString.includes('catalyst') ||
      searchString.includes('ios software') ||
      /switch[#>]/i.test(searchString) ||
      /router[#>]/i.test(searchString) ||
      /\(config\)#/i.test(searchString)
    ) {
      return { type: 'cisco', label: 'Cisco IOS / Catalyst' };
    }

    if (
      searchString.includes('huawei') ||
      searchString.includes('vrp') ||
      /<huawei>/i.test(searchString) ||
      /\[huawei\]/i.test(searchString)
    ) {
      return { type: 'huawei', label: 'Huawei VRP' };
    }

    if (
      searchString.includes('juniper') ||
      searchString.includes('junos') ||
      /cli>/i.test(searchString)
    ) {
      return { type: 'juniper', label: 'Juniper JunOS' };
    }

    if (
      searchString.includes('linux') ||
      searchString.includes('ubuntu') ||
      searchString.includes('debian') ||
      searchString.includes('centos') ||
      searchString.includes('bash') ||
      /[a-z0-9_.-]+@[a-z0-9_.-]+[:~]/i.test(searchString)
    ) {
      return { type: 'linux', label: 'Servidor Linux / SSH' };
    }

    if (
      searchString.includes('windows') ||
      searchString.includes('powershell') ||
      /ps [a-z]:\\/i.test(searchString)
    ) {
      return { type: 'windows', label: 'Servidor Windows' };
    }

    // Padrão de rede remota genérica
    return { type: 'cisco', label: 'Equipamento de Rede (Cisco/Telnet)' };
  }

  // 3. Shell Local
  if (tab.shellType === 'powershell' || tab.shellType === 'cmd') {
    return { type: 'windows', label: 'PowerShell / Local Shell' };
  }

  if (tab.shellType === 'bash' || tab.shellType === 'zsh') {
    return { type: 'linux', label: 'Bash / Local Shell' };
  }

  return { type: 'cyberdeck', label: 'Cyberdeck Universal Shell' };
}

/**
 * Encontra o maior prefixo comum entre uma lista de palavras
 */
function findLongestCommonPrefix(words: string[]): string {
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];

  let prefix = words[0];
  for (let i = 1; i < words.length; i++) {
    while (!words[i].toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}

export interface AutocompleteResult {
  completedText: string | null;
  suggestions: string[];
  equipmentLabel: string;
}

/**
 * Processa a tecla TAB e retorna sugestões ou texto autocompletado
 */
export function getEquipmentCompletions(
  rawInput: string,
  tab: TerminalTab
): AutocompleteResult {
  const { type, label } = detectEquipment(tab);

  // Seleciona dicionário conforme o equipamento
  let primaryCommands: string[] = [];
  switch (type) {
    case 'cisco':
      primaryCommands = CISCO_COMMANDS;
      break;
    case 'mikrotik':
      primaryCommands = MIKROTIK_COMMANDS;
      break;
    case 'huawei':
      primaryCommands = HUAWEI_COMMANDS;
      break;
    case 'juniper':
      primaryCommands = JUNIPER_COMMANDS;
      break;
    case 'linux':
      primaryCommands = LINUX_COMMANDS;
      break;
    case 'windows':
      primaryCommands = WINDOWS_COMMANDS;
      break;
    default:
      primaryCommands = [...CYBERDECK_COMMANDS, ...WINDOWS_COMMANDS, ...LINUX_COMMANDS];
  }

  // Se estiver em shell local, mescla com os comandos do Cyberdeck
  const allCommands =
    tab.sessionState === 'local_shell'
      ? Array.from(new Set([...primaryCommands, ...CYBERDECK_COMMANDS]))
      : primaryCommands;

  const trimmed = rawInput.trim();

  // 1. Se a linha estiver vazia, retorna os comandos mais comuns do equipamento
  if (!trimmed) {
    return {
      completedText: null,
      suggestions: allCommands.slice(0, 8),
      equipmentLabel: label,
    };
  }

  const lowerInput = trimmed.toLowerCase();

  // 2. Busca comandos que começam com o que foi digitado
  let matches = allCommands.filter((cmd) => cmd.toLowerCase().startsWith(lowerInput));

  // 3. Se não houver correspondência exata de início, busca comandos que contenham o termo
  if (matches.length === 0) {
    matches = allCommands.filter((cmd) => cmd.toLowerCase().includes(lowerInput));
  }

  // 4. Sem correspondência
  if (matches.length === 0) {
    return {
      completedText: null,
      suggestions: [],
      equipmentLabel: label,
    };
  }

  // 5. Exatamente 1 correspondência -> Completa automaticamente adicionando espaço!
  if (matches.length === 1) {
    return {
      completedText: matches[0] + ' ',
      suggestions: matches,
      equipmentLabel: label,
    };
  }

  // 6. Múltiplas correspondências -> Completa pelo prefixo comum (se houver avanço)
  const commonPrefix = findLongestCommonPrefix(matches);
  if (commonPrefix && commonPrefix.length > trimmed.length) {
    return {
      completedText: commonPrefix,
      suggestions: matches,
      equipmentLabel: label,
    };
  }

  // 7. Já está no maior prefixo comum -> Exibe lista de sugestões do equipamento
  return {
    completedText: null,
    suggestions: matches,
    equipmentLabel: label,
  };
}

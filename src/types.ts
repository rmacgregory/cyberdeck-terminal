export type TerminalTheme = 'green' | 'amber' | 'cyan' | 'magenta';

export type LineType = 'stdout' | 'dim' | 'error' | 'warning' | 'info' | 'success' | 'cmd';

export interface TerminalLine {
  id: string;
  type: LineType;
  text: string;
  isHtml?: boolean;
}

export type ProtocolType = 'SSH' | 'TELNET' | 'PING' | 'SCAN' | 'HTTP' | 'RAW';

export interface QuickSession {
  id: string;
  name: string;
  host: string;
  ip: string;
  port?: number;
  protocol: ProtocolType;
  user?: string;
  authType?: 'password' | 'key';
  privateKey?: string; // PEM / OpenSSH format
  passphrase?: string;
  deviceType?: 'auto' | 'cisco' | 'mikrotik' | 'huawei' | 'juniper' | 'linux' | 'windows';
}

export type LogLevel = 'INFO' | 'CONNECT' | 'DATA' | 'WARN' | 'ERR' | 'SUCCESS';

export interface ConnectionLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  protocol: string;
  target?: string;
  message: string;
}

export type SessionState =
  | 'windows_shell'
  | 'local_shell'
  | 'remote_session'
  | 'connecting';

export type CrtMode = 'real' | 'subtle' | 'off';

export interface CrtConfig {
  mode: CrtMode;
  bloom: 'extreme' | 'normal' | 'soft';
  curvature: boolean;
  curvatureIntensity: number; // 0 a 100%
  brightness: number; // 70 a 200%
  vignetteIntensity: number; // 0 a 100%
  cursorBlinkRate: number; // 0 = sem piscar (estático), 0.25 a 2.0s
  bezel: boolean;
  scanlines: boolean;
  jitter: boolean;
  jitterIntensity: number; // 0 a 100%
  hertz: boolean; // Efeito das faixas de varredura Hertz passando na tela
  hertzSpeed: number; // Velocidade das faixas (1 a 100)
  hertzWidth: number; // Largura / espessura das faixas (5 a 100)
}

export interface SystemMetrics {
  cpu: number;
  ramUsedMb: number;
  ramTotalMb: number;
  ramPercent: number;
  cores?: number;
  uptime?: number;
}

export type TerminalFontSize = 'sm' | 'md' | 'lg';
export type TerminalLineSpacing = 'tight' | 'normal' | 'loose';
export type TerminalFontFamily = 'share-tech' | 'vt323' | 'fira-code' | 'jetbrains';

export interface TypographyConfig {
  family: TerminalFontFamily;
  size: TerminalFontSize;
  spacing: TerminalLineSpacing;
}

export interface TerminalTab {
  id: string;
  title: string;
  protocol: 'LOCAL' | 'SSH' | 'TELNET' | 'PING' | 'RAW';
  target?: string;
  sessionState: SessionState;
  remoteSessionName: string;
  shellType: string;
  deviceType?: 'auto' | 'cisco' | 'mikrotik' | 'huawei' | 'juniper' | 'linux' | 'windows';
  currentPath: string;
  currentUsername: string;
  lines: TerminalLine[];
  inputValue: string;
  history: string[];
  historyIndex: number;
  pendingSsh: {
    host: string;
    port: number;
    user: string;
    authType?: 'password' | 'key';
    privateKey?: string;
    passphrase?: string;
  } | null;
  isPasswordInput: boolean;
  backendConnected: boolean;
  hasUnread?: boolean;
}


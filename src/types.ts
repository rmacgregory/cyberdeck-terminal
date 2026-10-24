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
  bezel: boolean;
  scanlines: boolean;
  jitter: boolean;
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
  currentPath: string;
  currentUsername: string;
  lines: TerminalLine[];
  inputValue: string;
  history: string[];
  historyIndex: number;
  pendingSsh: { host: string; port: number; user: string } | null;
  isPasswordInput: boolean;
  backendConnected: boolean;
  hasUnread?: boolean;
}


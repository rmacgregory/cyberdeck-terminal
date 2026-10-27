import React, { useRef, useEffect, useState } from 'react';
import { TerminalLine, CrtConfig, TypographyConfig } from '../types';

interface TerminalScreenProps {
  lines: TerminalLine[];
  inputValue: string;
  isPassword?: boolean;
  promptPrefix: string;
  promptColorClass?: string;
  onInputChange: (val: string) => void;
  onSubmit: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  crtConfig: CrtConfig;
  typographyConfig: TypographyConfig;
  isActive?: boolean;
  onFocusPane?: () => void;
}

export const TerminalScreen: React.FC<TerminalScreenProps> = ({
  lines,
  inputValue,
  isPassword = false,
  promptPrefix,
  promptColorClass = 'text-emerald-400',
  onInputChange,
  onSubmit,
  onKeyDown,
  crtConfig,
  typographyConfig,
  isActive = true,
  onFocusPane,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically whenever this pane becomes active
  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  // Phosphor Persistence (Ghosting) active check: ONLY active if mode === 'real' and phosphorGhosting is true
  const isGhostingActive = crtConfig.mode === 'real' && Boolean(crtConfig.phosphorGhosting);

  // 1. Ghosting for input (typed and backspaced / modified characters)
  const [ghostInput, setGhostInput] = useState<string>('');
  const [ghostKey, setGhostKey] = useState<number>(0);
  const prevInputRef = useRef<string>(inputValue);
  const ghostInputTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isGhostingActive) {
      setGhostInput('');
      prevInputRef.current = inputValue;
      return;
    }

    if (prevInputRef.current && prevInputRef.current !== inputValue) {
      // If characters were erased or changed, display the lingering phosphor ghost
      setGhostInput(prevInputRef.current);
      setGhostKey((k: number) => k + 1);

      if (ghostInputTimerRef.current) clearTimeout(ghostInputTimerRef.current);
      ghostInputTimerRef.current = setTimeout(() => {
        setGhostInput('');
      }, 450);
    }
    prevInputRef.current = inputValue;
  }, [inputValue, isGhostingActive]);

  // 2. Ghosting for cleared terminal lines (e.g. after 'clear' or 'cls')
  const [ghostClearedLines, setGhostClearedLines] = useState<TerminalLine[]>([]);
  const prevLinesRef = useRef<TerminalLine[]>(lines);
  const ghostLinesTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isGhostingActive) {
      setGhostClearedLines([]);
      prevLinesRef.current = lines;
      return;
    }

    // Detect if lines were cleared (previous had content, new is empty or reset to 1 line)
    if (prevLinesRef.current.length > 2 && lines.length <= 1) {
      setGhostClearedLines(prevLinesRef.current);
      if (ghostLinesTimerRef.current) clearTimeout(ghostLinesTimerRef.current);
      ghostLinesTimerRef.current = setTimeout(() => {
        setGhostClearedLines([]);
      }, 550);
    }

    prevLinesRef.current = lines;
  }, [lines, isGhostingActive]);

  // Auto-scroll downwards whenever output lines or input change
  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines, inputValue]);

  // Clicking anywhere in the terminal container focuses the typing cursor
  const handleContainerClick = () => {
    if (onFocusPane) {
      onFocusPane();
    }
    inputRef.current?.focus();
  };

  const getBloomClass = () => {
    if (crtConfig.mode !== 'real') return '';
    if (crtConfig.bloom === 'extreme') return 'crt-bloom-extreme';
    if (crtConfig.bloom === 'normal') return 'crt-bloom-real';
    return 'crt-glow';
  };

  const getLineClassName = (type: TerminalLine['type']) => {
    const bloom = getBloomClass();
    switch (type) {
      case 'cmd':
        return `line-cmd font-bold text-white ${bloom}`;
      case 'stdout':
        return `line-stdout ${bloom}`;
      case 'dim':
        return `line-dim opacity-75`;
      case 'error':
        return 'line-error font-semibold text-rose-400';
      case 'warning':
        return 'line-warning font-semibold text-amber-300';
      case 'info':
        return 'line-info text-cyan-300';
      case 'success':
        return `line-success font-semibold text-emerald-400 ${bloom}`;
      default:
        return `line-stdout ${bloom}`;
    }
  };

  const getFontFamilyClass = () => {
    switch (typographyConfig.family) {
      case 'vt323':
        return 'font-vt323';
      case 'fira-code':
        return 'font-fira-code';
      case 'jetbrains':
        return 'font-jetbrains';
      default:
        return 'font-share-tech';
    }
  };

  const getFontSizeClass = () => {
    switch (typographyConfig.size) {
      case 'sm':
        return 'term-size-sm';
      case 'lg':
        return 'term-size-lg';
      default:
        return 'term-size-md';
    }
  };

  const getLineSpacingClass = () => {
    switch (typographyConfig.spacing) {
      case 'tight':
        return 'term-space-tight';
      case 'loose':
        return 'term-space-loose';
      default:
        return 'term-space-normal';
    }
  };

  const typoClasses = `${getFontFamilyClass()} ${getFontSizeClass()} ${getLineSpacingClass()}`;

  return (
    <main
      onClick={handleContainerClick}
      className={`flex-1 flex flex-col min-h-0 relative select-text border crt-glow-box p-3 sm:p-4 bg-black/45 rounded backdrop-blur-[2px] transition-all duration-200 ${getFontFamilyClass()} ${
        isActive
          ? 'cursor-text ring-1 ring-emerald-500/20'
          : 'cursor-pointer opacity-70 hover:opacity-90 border-zinc-800'
      }`}
    >
      {/* Visual Inactive Indicator inside terminal screen */}
      {!isActive && (
        <div className="absolute top-2 right-3 z-30 pointer-events-none select-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-zinc-900/90 text-zinc-400 border border-zinc-700/60 backdrop-blur-sm shadow flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            CLIQUE PARA DIGITAR AQUI
          </span>
        </div>
      )}

      {/* Terminal Viewport: Content streams line-by-line downwards */}
      <div
        ref={viewportRef}
        className={`flex-1 overflow-y-auto space-y-1 ${typoClasses} pr-2 cyber-scrollbar relative z-10 transition-all ${
          isGhostingActive ? 'crt-phosphor-persistence' : ''
        }`}
      >
        {/* Ghost Overlay for Cleared Terminal Lines */}
        {isGhostingActive && ghostClearedLines.length > 0 && (
          <div className="crt-ghost-cleared-overlay space-y-1" aria-hidden="true">
            {ghostClearedLines.map((line: TerminalLine) => (
              <div
                key={`ghost-${line.id}`}
                className={`${getLineClassName(line.type)} break-words whitespace-pre-wrap select-none opacity-40`}
              >
                {line.isHtml ? <span dangerouslySetInnerHTML={{ __html: line.text }} /> : line.text}
              </div>
            ))}
          </div>
        )}

        {lines.map((line) => (
          <div
            key={line.id}
            className={`${getLineClassName(line.type)} break-words whitespace-pre-wrap transition-all`}
          >
            {line.isHtml ? (
              <span dangerouslySetInnerHTML={{ __html: line.text }} />
            ) : (
              line.text
            )}
          </div>
        ))}

        {/* ACTIVE INLINE PROMPT: Digitação diretamente na tela no final do fluxo */}
        <div className={`flex items-start flex-wrap mt-1 ${typoClasses} relative min-h-[1.5rem]`}>
          <span
            className={`font-bold mr-2 select-none whitespace-pre ${promptColorClass} ${getBloomClass()}`}
          >
            {promptPrefix}
          </span>
          <div className="relative inline-flex items-center flex-1 min-w-[80px]">
            {/* Phosphor Ghosting Afterglow Trail for Erased / Changed Characters */}
            {isGhostingActive && ghostInput && ghostInput !== inputValue && (
              <span
                key={`ghost-in-${ghostKey}`}
                className="crt-phosphor-ghost-trail whitespace-pre-wrap font-bold tracking-wide break-all"
                aria-hidden="true"
              >
                {isPassword ? '•'.repeat(ghostInput.length) : ghostInput}
              </span>
            )}

            {/* Display typed text */}
            <span
              className={`whitespace-pre-wrap font-bold text-white tracking-wide break-all relative z-10 ${getBloomClass()}`}
            >
              {isPassword ? '•'.repeat(inputValue.length) : inputValue}
            </span>
            {/* Blinking block terminal cursor when active, static outline when inactive */}
            {isActive ? (
              <span className="term-cursor ml-0.5 shrink-0 relative z-10" />
            ) : (
              <span className="w-2 h-4 border border-zinc-500/70 inline-block ml-0.5 shrink-0 relative z-10 opacity-40" />
            )}

            {/* Input capture */}
            <input
              ref={inputRef}
              type={isPassword ? 'password' : 'text'}
              value={inputValue}
              readOnly={!isActive}
              tabIndex={isActive ? 0 : -1}
              onChange={(e) => {
                if (!isActive) return;
                onInputChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (!isActive) return;
                onKeyDown(e);
              }}
              onFocus={() => {
                if (!isActive && onFocusPane) {
                  onFocusPane();
                }
              }}
              className={`absolute inset-0 w-full h-full opacity-0 z-20 text-transparent bg-transparent ${
                isActive ? 'cursor-text' : 'cursor-pointer'
              }`}
              autoFocus={isActive}
              autoCapitalize="off"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

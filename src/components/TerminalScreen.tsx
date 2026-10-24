import React, { useRef, useEffect } from 'react';
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
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      className={`flex-1 flex flex-col min-h-0 relative cursor-text select-text border crt-glow-box p-3 sm:p-4 bg-black/45 rounded backdrop-blur-[2px] ${getFontFamilyClass()}`}
    >
      {/* Terminal Viewport: Content streams line-by-line downwards */}
      <div
        ref={viewportRef}
        className={`flex-1 overflow-y-auto space-y-1 ${typoClasses} pr-2 cyber-scrollbar relative z-10 transition-all`}
      >
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
            {/* Display typed text */}
            <span
              className={`whitespace-pre-wrap font-bold text-white tracking-wide break-all ${getBloomClass()}`}
            >
              {isPassword ? '•'.repeat(inputValue.length) : inputValue}
            </span>
            {/* Blinking block terminal cursor */}
            <span className="term-cursor ml-0.5 shrink-0" />

            {/* Input capture */}
            <input
              ref={inputRef}
              type={isPassword ? 'password' : 'text'}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 text-transparent bg-transparent"
              autoFocus
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

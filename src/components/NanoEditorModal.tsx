import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Check, AlertCircle } from 'lucide-react';

interface NanoEditorModalProps {
  isOpen: boolean;
  filename: string;
  onClose: () => void;
  onSaveFile: (filename: string, content: string) => void;
  initialContent?: string;
}

export const NanoEditorModal: React.FC<NanoEditorModalProps> = ({
  isOpen,
  filename,
  onClose,
  onSaveFile,
  initialContent = '',
}) => {
  const [content, setContent] = useState<string>(initialContent);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setIsModified(false);
      setSaveNotice(null);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialContent, filename]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsModified(true);
    updateCursorPos(e.target);
  };

  const updateCursorPos = (el: HTMLTextAreaElement) => {
    const textBefore = el.value.substring(0, el.selectionStart);
    const lines = textBefore.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });
  };

  const handleSave = () => {
    onSaveFile(filename, content);
    setIsModified(false);
    setSaveNotice('Arquivo gravado com sucesso no Cyberdeck VFS!');
    setTimeout(() => {
      setSaveNotice(null);
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl + S -> Salvar
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    }
    // Ctrl + X -> Fechar
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalLines = content.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onKeyDown={handleKeyDown}
        className="w-full max-w-4xl h-[85vh] bg-zinc-950 border-2 border-cyan-500/80 rounded-lg shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden font-mono"
      >
        {/* Top Title Bar */}
        <div className="px-3 py-1.5 bg-cyan-950/70 border-b border-cyan-500/40 flex items-center justify-between text-xs font-bold text-cyan-300 select-none">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>GNU nano 7.2 (Cyberdeck Retro Edition)</span>
            <span className="text-zinc-500">|</span>
            <span className="text-white truncate">Arquivo: {filename}</span>
            {isModified && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                [Modificado]
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-200 flex items-center gap-1 font-bold cursor-pointer"
              title="Salvar arquivo (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              SALVAR
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Fechar editor (Ctrl+X)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save feedback banner */}
        {saveNotice && (
          <div className="px-3 py-1 bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Text Area Body with Line Numbers */}
        <div className="flex-1 flex overflow-hidden bg-black/60 relative">
          {/* Gutter Line Numbers */}
          <div className="w-12 py-3 pr-2 text-right text-zinc-600 select-none font-mono text-xs border-r border-zinc-800/80 bg-zinc-950/40 shrink-0 overflow-hidden">
            {Array.from({ length: totalLines }).map((_, i) => (
              <div key={i} className="leading-5">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyUp={(e) => updateCursorPos(e.currentTarget)}
            onClick={(e) => updateCursorPos(e.currentTarget)}
            placeholder="# Digite seu código, configuração de roteador ou anotação aqui..."
            className="flex-1 p-3 text-xs leading-5 bg-transparent text-cyan-100 placeholder:text-zinc-600 focus:outline-none resize-none cyber-scrollbar font-mono select-text"
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
          />
        </div>

        {/* Bottom Help / Keyboard Hints Bar */}
        <div className="p-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 select-none">
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-black/80 border border-zinc-700 text-white font-bold">^S</kbd> Salvar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-black/80 border border-zinc-700 text-white font-bold">^X</kbd> Sair
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-black/80 border border-zinc-700 text-white font-bold">Esc</kbd> Voltar
            </span>
          </div>

          <div className="text-[10px] text-zinc-400">
            Linha <strong className="text-white">{cursorPos.line}</strong>, Coluna <strong className="text-white">{cursorPos.col}</strong> | Total: {totalLines} linhas
          </div>
        </div>
      </div>
    </div>
  );
};

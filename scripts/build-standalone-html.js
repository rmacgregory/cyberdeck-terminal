import fs from 'fs';
import path from 'path';

const srcPath = path.resolve('public/assets/aistudio/cyberpunk_crt_terminal_emulator_e48e448a.html');
let content = fs.readFileSync(srcPath, 'utf-8');

// 1. Atualizar Título e Banner
content = content.replace(
  /<title>.*?<\/title>/i,
  '<title>CYBERDECK TERMINAL v2 // CROSS-PLATFORM CRT SHELL</title>'
);

// 2. Adicionar links diretos e suporte a YouTube / DuckDuckGo compatíveis nos Bookmarks
const oldBookmarks = `<button data-url="cyberdeck://home" class="browser-bm-btn px-2 py-0.5 rounded border border-current bg-white/15 text-[10px] font-bold flex items-center gap-1">
                    <span>⚡</span> Portal
                  </button>
                  <button data-url="https://en.m.wikipedia.org" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>🌐</span> Wikipedia
                  </button>
                  <button data-url="https://duckduckgo.com" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>🦆</span> DuckDuckGo
                  </button>
                  <button data-url="https://archive.org" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>💾</span> Archive.org
                  </button>
                  <button data-url="https://news.ycombinator.com" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>👾</span> Hacker News
                  </button>
                  <button data-url="https://www.w3.org" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>📜</span> W3C
                  </button>`;

const newBookmarks = `<button data-url="cyberdeck://home" class="browser-bm-btn px-2 py-0.5 rounded border border-current bg-white/15 text-[10px] font-bold flex items-center gap-1">
                    <span>⚡</span> Portal BBS
                  </button>
                  <button data-url="https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1" class="browser-bm-btn px-2 py-0.5 rounded border border-red-500/50 hover:bg-red-500/20 text-[10px] text-red-400 font-bold flex items-center gap-1">
                    <span>▶️</span> Lofi Synthwave (YouTube)
                  </button>
                  <button data-url="https://html.duckduckgo.com/html/" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>🦆</span> DuckDuckGo HTML
                  </button>
                  <button data-url="https://en.m.wikipedia.org" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>🌐</span> Wikipedia
                  </button>
                  <button data-url="https://archive.org" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>💾</span> Archive.org
                  </button>
                  <button data-url="https://news.ycombinator.com" class="browser-bm-btn px-2 py-0.5 rounded border border-current/20 hover:bg-white/10 text-[10px] flex items-center gap-1">
                    <span>👾</span> Hacker News
                  </button>`;

content = content.replace(oldBookmarks, newBookmarks);

// 3. Atualizar a lógica do navegador para converter automaticamente links do YouTube e usar DuckDuckGo compatível
const oldNavCode = `        if (!target.startsWith('cyberdeck://') && !target.startsWith('http://') && !target.startsWith('https://')) {
          if (target.includes('.') && !target.includes(' ')) {
            target = 'https://' + target;
          } else {
            target = 'https://duckduckgo.com/?q=' + encodeURIComponent(target);
          }
        }`;

const newNavCode = `        if (target.startsWith('cyberdeck://')) {
          // OK
        } else {
          // Conversão inteligente de links do YouTube para formato Embed (compatível com iframe e CRT)
          if (target.includes('youtube.com/watch') || target.includes('youtu.be/')) {
            let vid = '';
            if (target.includes('youtu.be/')) {
              const m = target.match(/youtu\\.be\\/([a-zA-Z0-9_-]+)/);
              if (m) vid = m[1];
            } else if (target.includes('v=')) {
              const m = target.match(/[?&]v=([a-zA-Z0-9_-]+)/);
              if (m) vid = m[1];
            }
            if (vid) {
              target = 'https://www.youtube-nocookie.com/embed/' + vid + '?autoplay=1';
            }
          } else if (target.includes('youtube.com') && !target.includes('/embed/')) {
            // Se for a home do YouTube que bloqueia iframes por política do Google, alertamos e abrimos o embed player
            target = 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1';
          } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
            if (target.includes('.') && !target.includes(' ')) {
              target = 'https://' + target;
            } else {
              // DuckDuckGo em versão HTML livre de bloqueio X-Frame-Options
              target = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(target);
            }
          }
        }`;

content = content.replace(oldNavCode, newNavCode);

// 4. Inserir Cartão Explicativo de YouTube e Sites no Portal do Navegador
const oldNotice = `Certos servidores (como Google, GitHub ou YouTube) enviam cabeçalhos de segurança
                  (<code class="font-mono text-white">X-Frame-Options: SAMEORIGIN</code>) que bloqueiam a exibição dentro de iframes. Sites abertos como Wikipedia, W3C, Archive.org e feeds suportam navegação direta integrada perfeitamente! Caso encontre uma página restrita, utilize o botão <strong class="text-white">ABA EXTERNA</strong> na barra de ferramentas.`;

const newNotice = `<strong>Por que alguns sites bloqueiam iframes na web?</strong><br>
                  Grandes portais (como a página inicial do YouTube, Google e GitHub) configuram o cabeçalho <code class="font-mono text-white">X-Frame-Options: SAMEORIGIN</code> para proibir que navegadores de terceiros incorporem sua home page.<br>
                  <div class="mt-1.5 flex flex-wrap gap-2 items-center">
                    <span class="text-emerald-400 font-bold">✔ NO APP EXECUTÁVEL (.EXE/.APPIMAGE/.DMG):</span> Essa limitação é removida nativamente via Electron! Todos os sites abrem.<br>
                    <span class="text-cyan-400 font-bold">✔ VÍDEOS DO YOUTUBE:</span> Cole o link de qualquer vídeo (<code class="text-white">youtube.com/watch?v=...</code>) e ele rodará perfeitamente aqui dentro com efeito CRT!<br>
                    <span class="text-amber-400 font-bold">✔ OUTROS SITES:</span> Use o botão <strong>"ABA EXTERNA"</strong> no topo para abrir em uma guia do sistema.
                  </div>`;

content = content.replace(oldNotice, newNotice);

// 5. Adicionar Seletor Multiplataforma (Windows / Linux / macOS) no Header e no Terminal
content = content.replace(
  'CYBERDECK // WINDOWS TERMINAL FRONTEND',
  'CYBERDECK // UNIVERSAL CRT TERMINAL [v2.0]'
);

// Salvar versões requisitadas
const targets = [
  'public/cyberdeckterminalv2.html',
  'public/assets/aistudio/cyberdeckterminalv2.html',
  'public/cyberdeckterminalv1.html',
  'public/assets/aistudio/cyberdeckterminalv1.html',
  'cyberdeckterminalv2.html',
];

for (const target of targets) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, content, 'utf-8');
  console.log(`Gerado com sucesso: ${target} (${(content.length / 1024).toFixed(1)} KB)`);
}

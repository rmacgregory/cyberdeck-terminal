# 📟 CYBERDECK CRT TERMINAL

> **Emulador de Terminal Retrofuturista, Universal Shell & Estação de Operações de Rede Multiplataforma**  
> Inspirado na estética clássica de monitores CRT de tubo dos anos 80/90, estações cyberpunk e ferramentas lendárias como o *Cool-Retro-Term*.

---

## ⚡ Visão Geral

O **Cyberdeck CRT Terminal** é um ambiente de terminal completo que une o visual nostálgico dos monitores de fósforo verde/âmbar com recursos modernos de produtividade, gerenciamento de servidores e rede.

Disponível tanto como **aplicativo desktop nativo de 64 bits** (Windows, Linux e macOS) quanto como **SPA Web portátil** e **arquivo HTML autônomo offline**.

---

## 🚀 Principais Funcionalidades

### 🖥️ 1. Simulação CRT & Efeitos Visuais Avançados
* **Curvatura Esférica do Tubo (Curvature)**: Simulação geométrica do vidro curvo de monitores analógicos antigos.
* **Brilho de Fósforo & Bloom Intenso**: Efeito de irradiação de luz nos caracteres (`Extreme`, `Normal`, `Soft`).
* **Linhas de Varredura (Scanlines)**: Efeito clássico de tubo de raios catódicos com animação sutil.
* **Moldura Vintage (Bezel)**: Carcaça industrial tática ao redor da tela, alternável com um clique.
* **4 Temas de Cores de Fósforo**:
  * 🟢 **Matrix Green**: O lendário verde fósforo P1 (#00ff66).
  * 🟡 **Amber CRT**: Fósforo âmbar clássico de estações industriais (#ffb000).
  * 🔵 **Neo Cyan**: Azul ciberpunk de alta visibilidade (#00f0ff).
  * 🟣 **Synthwave Magenta**: Rosa néon retrô (#ff0077).
* **Tipografia Customizável**:
  * Fontes: *Share Tech Mono*, *VT323 (DEC VT220)*, *Fira Code* e *JetBrains Mono*.
  * Controle de escala (*Pequena*, *Média*, *Grande*) e espaçamento entre linhas (*Compacto*, *Normal*, *Espaçado*).

### 🔊 2. Motor de Áudio Retrô (Web Audio API)
* Efeitos sonoros gerados por síntese sonora em tempo real (sem arquivos de áudio pesados).
* Sons táteis de teclado mecânico vintage ao digitar.
* Bipes de status e alertas táticos de comando.
* Som de portadora de modem (*carrier tone / handshake dial-up*) ao disparar comandos de rede.

### 🌐 3. Cyber-Net: Navegador Web CRT Embutido
* Navegue na web sem sair da interface do Cyberdeck!
* **Efeito CRT em tempo real sobre a web**: A tela do navegador herda a curvatura, o tom de fósforo e as scanlines.
* **Sem restrições de iframe no Desktop**: No aplicativo Electron, cabeçalhos de proteção (como `X-Frame-Options` e CSP) são ajustados localmente, permitindo abrir vídeos do YouTube, documentações técnicas, buscadores e ferramentas de rede.
* Comandos rápidos: `browser <url>` ou `youtube <id_ou_link>`.

### ⚡ 4. Terminal Real & Multi-Shell
* Suporte nativo a diferentes interpretadores de comando:
  * **Windows**: PowerShell (`pwsh`) e Prompt de Comando (`cmd.exe`).
  * **Linux / macOS**: Bash (`/bin/bash`), Zsh (`/bin/zsh`) e POSIX Shell (`/bin/sh`).
* Comunicação bidirecional contínua de baixa latência via **WebSockets (porta 3001)**.
* No modo Desktop (Electron), o servidor backend é iniciado automaticamente em segundo plano.

### 📡 5. Protocolos de Rede & Acesso Remoto
* **SSH Integrado**: Conecte-se diretamente a roteadores, switches e servidores Linux (`ssh usuario@host -p 22`).
* **Telnet & Raw TCP Socket**: Conexões diretas de socket com dispositivos legados, BBS e consoles de infraestrutura (`telnet host porta`).
* **Ping / ICMP Real**: Testes de alcance de pacotes e latência em milissegundos.
* **Painel de Acessos Rápidos (Quick Sessions)**: Salve conexões frequentes com IP, porta, protocolo e credenciais salvas localmente.
* **Auditoria de Logs em Tempo Real**: Telemetria detalhada de eventos de rede, pacotes TX/RX, conexões e comandos com filtros por nível (`INFO`, `WARN`, `ERROR`, `DATA`, `SUCCESS`).

### 💾 6. Modo Portátil & Offline
* **cyberdeckterminalv2.html**: Arquivo único empacotado que roda em qualquer navegador moderno sem necessidade de Node.js, internet ou instalação. Basta dar dois cliques.

---

## 💻 Como Executar

### Opção A: Baixar os Binários Prontos (Releases)

Acesse a aba [**Releases**](https://github.com/rmacgregory/cyberdeck-terminal/releases) do repositório para baixar:

| Sistema Operacional | Formato | Descrição |
| :--- | :--- | :--- |
| 🪟 **Windows** (64-bit) | `.exe` (Setup) | Instalador completo com atalho na Área de Trabalho e Menu Iniciar |
| 🪟 **Windows** (64-bit) | `.zip` (Portable) | **Portátil puro x64**: extraia e execute direto, sem instalação |
| 🪟 **Windows** (64-bit) | `.exe` (Portable) | Executável único portátil |
| 🐧 **Linux** (64-bit) | `.AppImage` | Portátil para Ubuntu, Debian, Fedora, Arch, etc. (`chmod +x` e rodar) |
| 🍎 **macOS** (Universal) | `.dmg` / `.zip` | Imagem de disco instalável para Mac (Intel & Apple Silicon) |

---

### Opção B: Rodar em Modo de Desenvolvimento (Código-Fonte)

#### Pré-requisitos:
* [Node.js](https://nodejs.org/) v18 ou superior.
* Git.

#### Passo a passo:
```bash
# 1. Clone o repositório
git clone https://github.com/rmacgregory/cyberdeck-terminal.git
cd cyberdeck-terminal

# 2. Instale as dependências
npm install

# 3. Inicie o servidor frontend e o terminal backend
npm run dev
```

Abra seu navegador em `http://localhost:3000`.

#### Para iniciar o aplicativo no modo Desktop (Electron):
```bash
npm run electron:start
```

---

## ⌨️ Guia de Comandos do Terminal

Digite os comandos abaixo diretamente no prompt do Cyberdeck:

| Comando | Descrição |
| :--- | :--- |
| `help` | Exibe a lista completa de comandos e sintaxe de uso |
| `systeminfo` | Exibe dados do sistema operacional, host e arquitetura (x64) |
| `theme <green\|amber\|cyan\|magenta>` | Altera a cor do fósforo da tela CRT |
| `crt <real\|subtle\|off\|bloom\|bezel\|curve>` | Controla os efeitos de tubo, curvatura, bloom e moldura |
| `font <família\|sm\|md\|lg\|normal\|compacto>` | Ajusta a tipografia e o espaçamento de linhas |
| `browser <url>` | Abre o navegador web Cyber-Net na URL informada |
| `youtube <link_ou_id>` | Abre o player do YouTube dentro da estética CRT |
| `powershell` / `cmd` / `bash` / `zsh` | Alterna o interpretador de comandos ativo |
| `ssh <usuario@host>` | Inicia uma sessão SSH com terminal interativo |
| `telnet <host> <porta>` | Abre um socket TCP Telnet/Raw |
| `ping <host>` | Dispara testes de latência ICMP |
| `download` | Baixa o arquivo portátil offline (`cyberdeckterminalv2.html`) |
| `clear` ou `cls` | Limpa a tela do terminal |

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Motion](https://motion.dev/).
* **Áudio & Gráficos**: Web Audio API com osciladores dinâmicos, filtros SVG/CSS customizados de tubo catódico e sombreamento esférico.
* **Backend de Terminal**: Node.js, [WebSocket (`ws`)](https://github.com/websockets/ws), [SSH2](https://github.com/mscdex/ssh2), Net Sockets nativos e Child Process (`spawn`).
* **Desktop Runtime**: [Electron](https://www.electronjs.org/) + [Electron Builder](https://www.electron.build/).
* **CI/CD**: GitHub Actions com matriz de compilação cruzada para Windows, Linux e macOS com publicação automática de Releases.

---

## 📄 Licença

Este projeto está sob a licença [Apache 2.0](LICENSE). Sinta-se livre para usar, estudar, modificar e distribuir.

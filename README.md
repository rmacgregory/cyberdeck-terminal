# 📟 CYBERDECK CRT TERMINAL

> **Emulador de Terminal Retrofuturista, Universal Shell & Estação de Operações de Rede Multiplataforma**  
> Inspirado na estética clássica de monitores CRT de tubo dos anos 80/90, estações cyberpunk e ferramentas lendárias como o *Cool-Retro-Term*.

---

> 🎮 **PROJETO EXPERIMENTAL & VIBECODING**  
> Este é um projeto desenvolvido exclusivamente para **diversão, nostalgia e exploração criativa**, feito no espírito total de **vibecoding** e codado puramente com a Inteligência Artificial do **Google AI Studio**. Sinta-se à vontade para testar, quebrar, modificar e se divertir!

---

## ⚡ Visão Geral

O **Cyberdeck CRT Terminal** é um ambiente de terminal completo que une o visual nostálgico dos monitores de fósforo verde/âmbar com recursos modernos de produtividade, gerenciamento de servidores e rede.

Disponível tanto como **aplicativo desktop nativo de 64 bits** (Windows, Linux e macOS) quanto como **SPA Web portátil** e **arquivo HTML autônomo offline**.

---

## 🚀 Principais Funcionalidades

### 📑 1. Múltiplas Abas & Conexões Simultâneas a Equipamentos
* **Operação Multi-Dispositivo**: Abra várias abas simultâneas para gerenciar múltiplos equipamentos ao mesmo tempo (ex: Roteador de Borda via SSH na Aba 1, Switch Core via Telnet na Aba 2 e Shell local do Windows/Linux na Aba 3).
* **Sessões Concorrentes e Isoladas**: Cada aba possui seu próprio canal de conexão, buffer de linhas, histórico de comandos e estado de autenticação independentes.
* **Notificação de Fundo**: Indicadores visuais na barra de abas avisam quando uma sessão em segundo plano recebe novas saídas de dados.
* **Gerenciamento Fácil**: Abra abas pelo botão `+ Nova Aba`, atalhos de teclado ou diretamente pelos comandos `tab new`, `tab close` e painel de Acessos Rápidos.

### 🖥️ 2. Simulação CRT & Efeitos Visuais Avançados
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

### 🔊 3. Motor de Áudio Retrô (Web Audio API)
* Efeitos sonoros gerados por síntese sonora em tempo real (sem arquivos de áudio pesados).
* Sons táteis de teclado mecânico vintage ao digitar.
* Bipes de status e alertas táticos de comando.
* Som de portadora de modem (*carrier tone / handshake dial-up*) ao disparar comandos de rede.

### 🌐 4. Cyber-Net: Navegador Web CRT Embutido *(ALPHA - Em Testes ⚠️)*
> ⚠️ **Status Alpha / Experimental**: A função de navegador integrado está em estágio inicial (Alpha) e possui bugs conhecidos. Muitos sites modernos utilizam proteções rígidas de incorporação (`X-Frame-Options`, CSP estrito e bloqueios de script) que impedem seu carregamento completo ou causam comportamentos imprevistos. O suporte e contorno dessas restrições estão sendo melhorados a cada versão.
* Navegue na web sem sair da interface do Cyberdeck!
* **Efeito CRT em tempo real sobre a web**: A tela do navegador herda a curvatura, o tom de fósforo e as scanlines.
* Comandos rápidos: `browser <url>` ou `youtube <id_ou_link>`.

### ⚡ 5. Terminal Real & Multi-Shell
* Suporte nativo a diferentes interpretadores de comando:
  * **Windows**: PowerShell (`pwsh`) e Prompt de Comando (`cmd.exe`).
  * **Linux / macOS**: Bash (`/bin/bash`), Zsh (`/bin/zsh`) e POSIX Shell (`/bin/sh`).
* Comunicação bidirecional contínua de baixa latência via **WebSockets (porta 3001)**.
* No modo Desktop (Electron), o servidor backend é iniciado automaticamente em segundo plano.

### 📡 6. Protocolos de Rede & Acesso Remoto
* **SSH Integrado**: Conecte-se diretamente a roteadores, switches e servidores Linux (`ssh usuario@host -p 22`).
* **Telnet & Raw TCP Socket**: Conexões diretas de socket com dispositivos legados, BBS e consoles de infraestrutura (`telnet host porta`).
* **Ping / ICMP Real**: Testes de alcance de pacotes e latência em milissegundos.
* **Painel de Acessos Rápidos (Quick Sessions)**: Salve conexões frequentes com IP, porta, protocolo e credenciais salvas localmente. Opção de conectar direto na aba atual ou abrir automaticamente em uma nova aba!
* **Auditoria de Logs em Tempo Real**: Telemetria detalhada de eventos de rede, pacotes TX/RX, conexões e comandos com filtros por nível (`INFO`, `WARN`, `ERROR`, `DATA`, `SUCCESS`).

### 💾 7. Modo Portátil & Offline
* **cyberdeckterminalv2.html**: Arquivo único empacotado que roda em qualquer navegador moderno sem necessidade de Node.js, internet ou instalação. Basta dar dois cliques.

---

## 💻 Como Executar

### Opção A: Baixar os Binários Prontos (Releases)

Acesse a aba [**Releases**](https://github.com/rmacgregory/cyberdeck-terminal/releases) do repositório para baixar:

| Sistema Operacional | Formato | Descrição |
| :--- | :--- | :--- |
| 🪟 **Windows** (64-bit) | `.exe` (Setup) | Instalador oficial 64-bit com atalhos |
| 🪟 **Windows** (64-bit) | `.zip` (Portable) | **Portátil puro 64-bit nativo**: extraia e execute direto, sem instalação |
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
| `tab new [nome]` | Abre uma nova aba de terminal para conectar em outro equipamento |
| `tab close` | Fecha a aba ativa atual |
| `tab rename <nome>` | Renomeia o título da aba atual |
| `theme <green\|amber\|cyan\|magenta>` | Altera a cor do fósforo da tela CRT |
| `crt <real\|subtle\|off\|bloom\|bezel\|curve>` | Controla os efeitos de tubo, curvatura, bloom e moldura |
| `font <família\|sm\|md\|lg\|normal\|compacto>` | Ajusta a tipografia e o espaçamento de linhas |
| `browser <url>` | Abre o navegador web Cyber-Net na URL informada *(Alpha)* |
| `youtube <link_ou_id>` | Abre o player do YouTube dentro da estética CRT |
| `powershell` / `cmd` / `bash` / `zsh` | Alterna o interpretador de comandos ativo |
| `ssh <usuario@host>` | Inicia uma sessão SSH com terminal interativo |
| `telnet <host> <porta>` | Abre um socket TCP Telnet/Raw |
| `ping <host>` | Dispara testes de latência ICMP |
| `download` | Baixa o arquivo portátil offline (`cyberdeckterminalv2.html`) |
| `clear` ou `cls` | Limpa a tela da aba atual |

---

## 🛠️ Tecnologias Utilizadas

* **Criação & Inteligência**: Desenvolvido integralmente em **vibecoding** assistido pelo **Google AI Studio**.
* **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Motion](https://motion.dev/).
* **Áudio & Gráficos**: Web Audio API com osciladores dinâmicos, filtros SVG/CSS customizados de tubo catódico e sombreamento esférico.
* **Backend de Terminal**: Node.js, [WebSocket (`ws`)](https://github.com/websockets/ws), [SSH2](https://github.com/mscdex/ssh2), Net Sockets nativos e Child Process (`spawn`).
* **Desktop Runtime**: [Electron](https://www.electronjs.org/) + [Electron Builder](https://www.electron.build/).
* **CI/CD**: GitHub Actions com matriz de compilação cruzada para Windows, Linux e macOS com publicação automática de Releases.

---

## 📄 Licença

Este projeto está sob a licença [Apache 2.0](LICENSE). Sinta-se livre para usar, estudar, modificar e distribuir.

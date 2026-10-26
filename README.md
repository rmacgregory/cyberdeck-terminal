# 📟 CYBERDECK CRT TERMINAL

> **Emulador de Terminal Retrofuturista, Universal Shell & Estação de Operações de Rede Multiplataforma**  
> Inspirado na estética clássica de monitores CRT de tubo dos anos 80/90, estações cyberpunk e ferramentas lendárias como o *Cool-Retro-Term*.

---

> 🎮 **PROJETO EXPERIMENTAL & VIBECODING**  
> Este é um projeto desenvolvido exclusivamente para **diversão, nostalgia e exploração criativa**, feito no espírito total de **vibecoding** e codado puramente com a Inteligência Artificial do **Google AI Studio**. Sinta-se à vontade para testar, quebrar, modificar e se divertir!

---

## ⚡ Visão Geral

O **Cyberdeck CRT Terminal** é um ambiente de terminal completo que une o visual nostálgico dos monitores de fósforo verde/âmbar com recursos modernos de produtividade, gerenciamento de servidores e rede.

Disponível como **aplicativo desktop nativo de 64 bits** (Windows, Linux e macOS), **aplicativo nativo Android APK para Tablets** (via Capacitor) e **SPA Web**.

---

## 🚀 Principais Funcionalidades

### 📑 1. Múltiplas Abas & Conexões Simultâneas a Equipamentos
* **Operação Multi-Dispositivo**: Abra várias abas simultâneas para gerenciar múltiplos equipamentos ao mesmo tempo (ex: Roteador de Borda via SSH na Aba 1, Switch Core via Telnet na Aba 2 e Shell local do Windows/Linux na Aba 3).
* **Sessões Concorrentes e Isoladas**: Cada aba possui seu próprio canal de conexão, buffer de linhas, histórico de comandos e estado de autenticação independentes.
* **Notificação de Fundo**: Indicadores visuais na barra de abas avisam quando uma sessão em segundo plano recebe novas saídas de dados.
* **Gerenciamento Fácil**: Abra abas pelo botão `+ Nova Aba`, atalhos de teclado ou diretamente pelos comandos `tab new`, `tab close` e painel de Acessos Rápidos.

### 🖥️ 2. Simulação CRT Avançada, Brilho, Curvatura, Jitter & Faixas de Hertz
* **Configurações Padrão Oficiais do Terminal**:
  * **Modo de Inicialização**: **CRT OFF** (abre em modo moderno, plano e de alto desempenho; ao ativar o filtro CRT, as seguintes configurações padrão calibradas são aplicadas instantaneamente).
  * **Brilho da Tela CRT**: **120%** (luminosidade reforçada para vivacidade óptica perfeita).
  * **Curvatura do Tubo CRT**: **Extremo (100%)** (máxima imersão física esférica de tubo catódico vintage).
  * **Intensidade da Vinheta**: **Suave (35%)** (escurecimento periférico suave que não esconde texto nos cantos).
  * **Brilho do Fósforo (Bloom)**: **Normal** (efeito de fósforo equilibrado para longa leitura sem cansar a visão).
  * **Tremor do Tubo (Jitter)**: **Desligado (0%)** (estabilidade sólida do feixe de elétrons por padrão).
  * **Blink Rate do Cursor**: **Lento 15% (1.40s)** (cadência de piscada lenta, elegante e não intrusiva).
  * **Faixas de Hertz (Varredura Analógica)**: **Ligado** com **Velocidade 15%**, **Largura das Faixas 100%** e **Transparência 5% Ultra Suave** (varredura contínua ampla, quase transparente e relaxante).
  * **Grade de Fósforo (Scanlines & Aperture Grille)**: **Desativada por padrão** (nitidez e leitura cristalina).
  * **Phosphor Persistence (Ghosting / Persistência do Fósforo)**: **Ativado no modo CRT Real** (decaimento analógico de ~450ms nos caracteres).
* **Phosphor Persistence (Ghosting Analógico do Fósforo)**: Simulação física da lenta dissipação luminosa dos elétrons em tubos CRT reais (fósforos P1 Green e P3 Amber):
  * **Decaimento Suave de Caracteres**: Caracteres apagados, alterados ou removidos via backspace persistem por ~450 milissegundos em silhueta de afterglow antes de sumir completamente.
  * **Decaimento ao Limpar a Tela (`clear` / `cls`)**: O conteúdo anterior decai suavemente na tela em 550ms em vez de cortar bruscamente a zero.
  * **Botão Liga/Desliga no HUD**: Botão dedicado dentro do menu de configurações de tela CRT para ligar e desligar a qualquer momento.
  * **Exclusividade do Modo CRT Real**: Este efeito funciona **estritamente quando o filtro CRT Real está ativado**. Nos modos **CRT Leve** e **CRT Off**, o efeito fica automaticamente desligado e com o botão bloqueado (`[INDISPONÍVEL]`), garantindo máxima fidelidade aos diferentes modos visuais.
  * **Comandos de Terminal**: `ghost on`, `ghost off`, `crt ghost`, `phosphor on/off`.
* **Exibição Edge-to-Edge Limpa (Sem Moldura / Bezel)**: A antiga moldura industrial pesada de monitor foi removida, liberando 100% da área útil da janela em todos os modos, garantindo visual moderno e limpo sem obstruções visuais.
* **Efeito das Faixas de Hertz (Varredura Analógica / Roll Bars Suaves & Quase Transparentes)**: Simulação refinada de interferência de frequência de rede (50Hz/60Hz AC hum e desincronização da taxa de varredura vertical) com passagem contínua de faixas luminosas ultra suaves e quase transparentes pela tela, preservando a legibilidade total do texto sem cansar a visão:
  * **Transparência & Suavidade Calibradas**: Gradientes rebalanceados para serem quase transparentes (alfa ultra baixo de 2% a 5%), sem cortes pretos bruscos ou faixas agressivas.
  * **Controle de Opacidade / Intensidade**: Ajustável de 0% (invisível) a 100% com slider e presets dedicados (*Ultra Suave 5%*, *Suave 15%*, *Padrão 35%*, *Marcada 60%*).
  * **Velocidade de Passagem**: De 1% (varredura ultra lenta e relaxante de 15s) a 100% (flutter rápido de 0.5s). Padrão em 15%.
  * **Largura das Faixas**: De 5% (linhas de feixe finas de 30px) a 100% (macrofaixas de interferência de 420px). Padrão em 100%.
  * **Presets Rápidos**: *Ultra Suave (Padrão)*, *50Hz Drift*, *60Hz CRT Clássico* e *Interferência AC*.
  * Comandos de Terminal: `hertz <velocidade> [largura]`, `hertz opacity <0-100>`, `hertz speed <1-100>`, `hertz width <5-100>`, `hertz suave`, `hertz 60hz`, `hertz off/on`.
* **Tremor da Imagem (Jitter do Tubo CRT)**: Animação CSS de instabilidade aleatória do canhão de elétrons ajustável de 0% (imagem estável) a 100% (caos vintage), configurável pelo HUD ou comando `jitter <0-100|off>`.
* **Controle Dinâmico de Brilho**: Ajuste fino da luminosidade do monitor CRT de 70% a 200% via slider na interface ou comando `brightness <valor>`.
* **Curvatura do Tubo Regulável**: Intensidade da distorção esférica ajustável de 0% (plano total) até 100% (tubo esférico vintage acentuado) via slider ou comando `curve <0-100>`.
* **Intensidade da Vinheta**: Controle óptico do escurecimento das bordas (0% desligado até 100% escuro) com presets rápidos no HUD e comando `vinheta <0-100|off>`.
* **Taxa de Piscada do Cursor (Blink Rate)**: Controle no HUD com preview ao vivo, suportando modo fixo/estático (`solid`), lento, normal ou turbo (comando `cursor <solid|0.5s|turbo>`).
* **Configurações Unificadas de Tela & Tipografia**: Fontes, tamanhos e espaçamento agora acessíveis diretamente dentro do menu de configurações CRT.
* **Brilho de Fósforo & Bloom Intenso**: Efeito de irradiação de luz nos caracteres (`Extreme`, `Normal`, `Soft`).
* **Linhas de Varredura (Scanlines & Aperture Grille)**: Efeito clássico de tubo de raios catódicos com subpixels RGB analógicos (desativada por padrão para máxima nitidez).
* **4 Temas de Cores de Fósforo**:
  * 🟢 **Matrix Green**: O lendário verde fósforo P1 (#00ff66).
  * 🟡 **Amber CRT**: Fósforo âmbar clássico de estações industriais (#ffb000).
  * 🔵 **Neo Cyan**: Azul ciberpunk de alta visibilidade (#00f0ff).
  * 🟣 **Synthwave Magenta**: Rosa néon retrô (#ff0077).
* **Tipografia Customizável**:
  * Fontes: *Share Tech Mono*, *VT323 (DEC VT220)*, *Fira Code* e *JetBrains Mono*.
  * Controle de escala (*Pequena*, *Média*, *Grande*) e espaçamento entre linhas (*Compacto*, *Normal*, *Espaçado*).

### 📊 3. Telemetria Real do Sistema (CPU & Memória RAM)
* **Monitoramento Real em Tempo Real**: O terminal lê o uso real de CPU e memória RAM do computador em que está rodando diretamente via Node.js (`os.cpus()`, `os.totalmem()`, `os.freemem()`).
* **Exibição no HUD Superior**: Acompanhe o consumo do hardware enquanto executa comandos pesados ou administra servidores.

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

### 📡 6. Protocolos de Rede, Chaves SSH & Autocompletação Inteligente
* **Varredura de Sub-rede ICMP (Ping-Sweep)**: Comando `ping-sweep <sub-rede/CIDR>` (ex: `ping-sweep 192.168.1.0/24`, `10.0.0.0/24`, `172.16.1.0/24`) para descobrir e mapear todos os dispositivos ativos da rede local em tempo real, exibindo tabela formatada com status `[ONLINE]`, IP, tempo de resposta (RTT em ms), identificação de hardware e endereço MAC, com resumo estatístico ao final.
* **SSH Integrado com Chaves Privadas (PEM / OpenSSH / RSA / Ed25519)**: Conexão direta por senha ou arquivo de chave (`ssh -i chave.pem usuario@host -p 22`) e leitor de arquivos no modal de conexões rápidas.
* **Autocompletação por Equipamento (`[TAB]`)**: O terminal detecta se você está conectado a roteadores e switches (Cisco IOS, MikroTik RouterOS, Huawei VRP, Juniper JunOS) ou servidores (Linux/Windows) e autocompleta os comandos nativos do dispositivo.
* **Telnet & Raw TCP Socket**: Conexões diretas de socket com dispositivos legados, BBS e consoles de infraestrutura (`telnet host porta`).
* **Ping / ICMP Real**: Testes de alcance de pacotes e latência em milissegundos.
* **Painel de Acessos Rápidos (Quick Sessions)**: Salve conexões frequentes com IP, porta, protocolo, tipo de equipamento e credenciais (senha ou chave privada). Opção de conectar direto na aba atual ou abrir automaticamente em uma nova aba!
* **Auditoria de Logs em Tempo Real**: Telemetria detalhada de eventos de rede, pacotes TX/RX, conexões e comandos com filtros por nível (`INFO`, `WARN`, `ERROR`, `DATA`, `SUCCESS`).

---

## 💻 Como Executar

### Opção A: Baixar os Binários Prontos (Releases)

Acesse a aba [**Releases**](https://github.com/rmacgregory/cyberdeck-terminal/releases) do repositório para baixar:

| Sistema Operacional | Formato | Nome do Arquivo no Release | Descrição |
| :--- | :--- | :--- | :--- |
| 🪟 **Windows** (64-bit) | `.exe` (Setup) | `Cyberdeck-CRT-Terminal-<versao>-windows-Setup.exe` | Instalador oficial 64-bit com atalhos |
| 🪟 **Windows** (64-bit) | `.exe` (Portable) | `Cyberdeck-CRT-Terminal-<versao>-windows-Portable.exe` | Executável único portátil 64-bit |
| 🪟 **Windows** (64-bit) | `.zip` (Portable) | `Cyberdeck-CRT-Terminal-<versao>-windows-x64.zip` | Compactado portátil 64-bit nativo |
| 🐧 **Linux** (64-bit) | `.AppImage` | `Cyberdeck-CRT-Terminal-<versao>-linux.AppImage` | Portátil para Ubuntu, Debian, Fedora, Arch, etc. |
| 🍎 **macOS** (Apple Silicon) | `.dmg` / `.zip` | `Cyberdeck-CRT-Terminal-<versao>-macos-arm64.dmg` / `.zip` | Pacote nativo dedicado para chips M1/M2/M3/M4 |
| 🍎 **macOS** (Intel x64) | `.dmg` / `.zip` | `Cyberdeck-CRT-Terminal-<versao>-macos-x64.dmg` / `.zip` | Pacote nativo dedicado para processadores Intel Mac |
| 📱 **Android** (Tablet/Mobile) | `.apk` | `Cyberdeck-CRT-Terminal-<versao>-android.apk` | Pacote nativo com tag explícita de plataforma Android |

* 🍎 **Para usuários de Mac**: Consulte o [**Guia de Uso no macOS (COMO-RODAR-NO-MAC.md)**](./COMO-RODAR-NO-MAC.md) para saber como liberar o app no Gatekeeper caso o macOS exiba o aviso padrão de "desenvolvedor não identificado" ou "app danificado".
* 📱 **Para usuários de Android**: Consulte o [**Guia de Uso no Android (COMO-RODAR-NO-ANDROID.md)**](./COMO-RODAR-NO-ANDROID.md) para detalhes completos de instalação no tablet e compilação do APK.

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

| Comando / Atalho | Descrição |
| :--- | :--- |
| `help` | Exibe a lista completa de comandos e sintaxe de uso |
| `[TAB]` | Autocompleta comandos de acordo com o equipamento conectado (Cisco, MikroTik, Linux, etc.) |
| `systeminfo` | Exibe dados do sistema operacional, host e arquitetura (x64) |
| `tab new [nome]` | Abre uma nova aba de terminal para conectar em outro equipamento |
| `tab close` | Fecha a aba ativa atual |
| `tab rename <nome>` | Renomeia o título da aba atual |
| `theme <green\|amber\|cyan\|magenta>` | Altera a cor do fósforo da tela CRT |
| `crt <real\|subtle\|off\|bloom\|bezel\|curve>` | Controla os efeitos de tubo, curvatura, bloom e moldura |
| `brightness <70-200>` | Ajusta a intensidade luminosa de fósforo da tela |
| `curve <0-100\|off>` | Ajusta o raio de curvatura esférica do tubo CRT |
| `vinheta <0-100\|off>` | Ajusta a vinheta óptica analógica de escurecimento periférico |
| `jitter <0-100\|off>` | Ajusta a intensidade do tremor/instabilidade analógica do tubo CRT |
| `hertz <vel> [largura]` | Controla faixas de varredura Hertz (velocidade 1-100, largura 5-100, off/on) |
| `ghost <on\|off>` | Ativa/desativa o efeito de Phosphor Persistence (Ghosting) no modo CRT Real |
| `cursor <solid\|0.5s\|slow\|fast>` | Ajusta a taxa de piscada (blink rate) do cursor do terminal |
| `font <família\|sm\|md\|lg\|normal\|compacto>` | Ajusta a tipografia e o espaçamento de linhas |
| `browser <url>` | Abre o navegador web Cyber-Net na URL informada *(Alpha)* |
| `youtube <link_ou_id>` | Abre o player do YouTube dentro da estética CRT |
| `powershell` / `cmd` / `bash` / `zsh` | Alterna o interpretador de comandos ativo |
| `ssh [-i chave.pem] <usuario@host>` | Conecta via SSH com suporte a senha ou chave privada (PEM/OpenSSH) |
| `telnet <host> <porta>` | Abre um socket TCP Telnet/Raw |
| `ping <host>` | Dispara testes de latência ICMP |
| `clear` ou `cls` | Limpa a tela da aba atual |

---

## 🛠️ Tecnologias Utilizadas

* **Criação & Inteligência**: Desenvolvido integralmente em **vibecoding** assistido pelo **Google AI Studio**.
* **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Motion](https://motion.dev/).
* **Gráficos CRT**: Filtros SVG/CSS customizados de tubo catódico, brilho, curvatura 3D e vinheta óptica ajustável.
* **Backend de Terminal**: Node.js, [WebSocket (`ws`)](https://github.com/websockets/ws), [SSH2](https://github.com/mscdex/ssh2), Net Sockets nativos e Child Process (`spawn`).
* **Desktop Runtime**: [Electron](https://www.electronjs.org/) + [Electron Builder](https://www.electron.build/).
* **Mobile Runtime**: [Capacitor](https://capacitorjs.com/) para Android nativo (SDK 36, Java 21 / Temurin, Gradle 8.14+).
* **CI/CD & Cross-Compilação Multiplataforma**: GitHub Actions com matriz de compilação cruzada para Windows (x64), Linux (`.AppImage` com compatibilidade `libfuse2/t64`), macOS (`.dmg` e `.zip` nativos dedicados para Apple Silicon `arm64` e Intel `x64` com assinatura Ad-Hoc) e Android (`.apk` com pipeline unificado em `JavaVersion.VERSION_21` e encoding UTF-8 em todos os módulos Gradle), com versionamento estrito SemVer (`MAJOR.MINOR.PATCH`) e publicação automática de Releases.

---

## 📄 Licença

Este projeto está sob a licença [Apache 2.0](LICENSE). Sinta-se livre para usar, estudar, modificar e distribuir.

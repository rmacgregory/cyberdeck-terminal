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

#### 🪟 2. Split-Screen (Divisão de Tela Lado a Lado ou Cima/Baixo) & Modo Broadcast
* **Divisão de Tela Flexível**:
  * Divida o espaço de trabalho em dois terminais ativos simultaneamente com orientação **Vertical** (`split -v`, lado a lado) ou **Horizontal** (`split -h`, cima e baixo).
  * Botão de alternância rápida de orientação no topo dos terminais.
* **Indicação Visual de Foco**:
  * Borda destacada e indicadores luminosos (`EM FOCO (DIGITANDO AQUI)` vs `INATIVO — CLIQUE P/ FOCAR`) garantem que você sempre saiba exatamente em qual painel está digitando.
* **Navegação por Teclado Entre Painéis**:
  * Alterne o foco rapidamente usando `Alt + ←` / `Alt + ↑` (Painel 1) e `Alt + →` / `Alt + ↓` ou `Alt + P` (Painel 2).
* **Modo Broadcast / Sincronizado (`broadcast on/off` ou `sync`)**:
  * Quando ativado, os comandos digitados no painel ativo são transmitidos e executados em ambos os terminais simultaneamente — ideal para comparar saídas, atualizar múltiplos servidores ou monitorar logs em paralelo.

### 📝 3. Editor de Texto Embutido Estilo GNU nano (`nano` / `edit`) & Sistema Virtual de Arquivos (VFS)
* **Editor CRT em Tela Cheia**: Abra e edite scripts, arquivos de configuração ou anotações com o clássico visual retrô do GNU nano (`nano <arquivo>` ou `edit <arquivo>`).
* **Numeração de Linhas & Atalhos Nativos**: Posição do cursor em tempo real, numeração de linhas, `Ctrl + S` para salvar e `Ctrl + X` para fechar.
* **Armazenamento Persistente em VFS**: Arquivos salvos persistem no armazenamento local (`localStorage`), sobrevivendo a reinicializações.
* **Comandos de Gerenciamento de Arquivos**:
  * `cat <arquivo>`: Exibe o conteúdo de um arquivo virtual diretamente na tela do terminal.
  * `rm <arquivo>`: Remove arquivos do sistema virtual.
  * `ls` / `dir`: Lista os arquivos virtuais juntamente com as pastas e diretórios locais.

### 📊 4. Monitor Interativo de Processos e CPU estilo HTOP (`htop` / `top`)
* **Dashboard CRT com Telemetria Dinâmica**: Modal em tela cheia com medidores animados de uso de núcleos de CPU (`Core 1`, `Core 2`, etc.), memória RAM e Swap.
* **Tabela de Processos Completa**: Lista detalhada com PID, Usuário, %CPU, %Memória, Prioridade e Nome do Processo.
* **Filtro em Tempo Real & Ordenação**: Pesquisa rápida por nome/PID e reordenação instantânea por CPU, memória ou PID.
* **Finalização de Processos**: Seleção de processos para envio de sinais de término (`SIGTERM` / `SIGKILL`).

### 🔍 5. Diagnóstico Avançado de Rede: Nmap & Traceroute
* **Scanner de Portas TCP (`nmap` / `scanport`)**:
  * Varredura visual de portas comuns (SSH `22`, Telnet `23`, HTTP `80`, HTTPS `443`, MySQL `3306`, RDP `3389`, etc.) ou portas customizadas (`nmap 192.168.1.1` ou `scanport 10.0.0.1 80 443 8080`), com cálculo de latência e banners de serviço.
* **Rastreador de Rota (`traceroute` / `tracert` / `mtr`)**:
  * Traçado visual de saltos de rede (hops), cálculo individual de RTT em milissegundos e nós de tráfego (`traceroute 8.8.8.8` ou `mtr google.com`).

### 💾 6. Exportação de Sessão & Auditoria de Logs (`export` / `savelog`)
* **Download do Histórico Completo**: O comando `export` ou `savelog` gera instantaneamente um arquivo `.log` para download contendo o timestamp da sessão, comandos digitados e todas as saídas de texto formatadas.

### ⚡ 7. Barra de Ações e Macros Rápidas (`Quick Macros Ribbon`)
* **Execuções a Um Clique**: Barra retrátil no topo do terminal com atalhos para ações essenciais: *Ping GW*, *Scan /24*, *Nmap*, *Traceroute*, *Htop*, *Nano*, *Exportar Log*, *Limpar Tela* e *Modo Broadcast*.
* **Controle Rápido**: Oculte ou exiba a barra pelo botão `[⚡ Macros]` no HUD ou pelo comando `macros`.

### 🎛️ 8. Painéis Laterais Recolhíveis com Divisor Ultrafino & Área Máxima
* **Lingueta Minimalista na Divisão**: Botão com micro-seta ultrafina localizado diretamente na linha divisória entre o terminal e as barras laterais.
* **Maximização do Terminal**: Recolha as *Sessões Rápidas* e os *Logs de Conexão* juntos com 1 clique ou pelo atalho `Alt + B`, liberando 100% da largura da janela para o terminal. O estado recolhido é memorizado automaticamente entre recargas.

### 🎯 9. Cursor Dinâmico CRT com Inversão de Caractere & Navegação Completa
* **Navegação com Setas e Teclado**: O cursor do terminal agora caminha livremente entre as letras ao pressionar `←` (Seta Esquerda), `→` (Seta Direita), `Home`, `End` ou clicar com o mouse.
* **Inversão Autêntica de Caractere CRT**: Ao posicionar o cursor sobre uma letra, o bloco de fósforo envolve o caractere invertendo suas cores (bloco brilhante com letra em preto no ciclo ativo), exatamente como em terminais analógicos clássicos (VT100/xterm).
* **Edição no Meio da Linha**: Apague ou insira novos caracteres em qualquer posição do comando com acompanhamento visual imediato.

### 🧲 10. Efeito de "Degauss" (Desmagnetização da Bobina do Tubo CRT)
* **Choque Eletromagnético Analógico**: Efeito visual de clarão luminoso acompanhado de tremor transitório de desmagnetização da bobina catódica.
* **Acionamento**: Botão `[⚡ DEGAUSS]` no HUD superior ou comando `degauss` no terminal.

### 🖥️ 11. Simulação CRT Avançada, Pop-up Centralizado, Curvatura & Faixas de Hertz
* **Painel de Opções CRT Centralizado**: O menu de opções agora abre como uma janela flutuante pop-up centralizada com abas organizadas (*Efeitos CRT*, *Varredura & Hertz*, *Tipografia*).
* **Configurações Padrão Oficiais do Terminal**:
  * **Modo de Inicialização**: **CRT OFF** (abre em modo moderno, plano e de alto desempenho; ao ativar o filtro CRT, as seguintes configurações padrão calibradas são aplicadas instantaneamente).
  * **Brilho da Tela CRT**: **120%** (luminosidade reforçada para vivacidade óptica perfeita).
  * **Curvatura do Tubo CRT**: **Extremo (100%)** (máxima imersão física esférica de tubo catódico vintage).
  * **Intensidade da Vinheta**: **Suave (35%)** (escurecimento periférico suave que não esconde texto nos cantos).
  * **Brilho do Fósforo (Bloom)**: **Normal** (efeito de fósforo equilibrado para longa leitura sem cansar a visão).
  * **Tremor do Tubo (Jitter)**: Alternância Liga/Desliga com intensidade suave calibrada.
  * **Blink Rate do Cursor**: **Lento 15% (1.40s)** (cadência de piscada lenta, elegante e não intrusiva).
  * **Faixas de Hertz (Varredura Analógica)**: **Ligado** com **Velocidade 15%**, **Largura das Faixas 100%** e **Transparência 5% Ultra Suave**.
  * **Grade de Fósforo (Scanlines & Aperture Grille)**: **Desativada por padrão** (nitidez e leitura cristalina).
  * **Phosphor Persistence (Ghosting / Persistência do Fósforo)**: **Ativado no modo CRT Real** (decaimento analógico de ~450ms nos caracteres).
* **Phosphor Persistence (Ghosting Analógico do Fósforo)**: Simulação física da lenta dissipação luminosa dos elétrons em tubos CRT reais (fósforos P1 Green e P3 Amber):
  * **Decaimento Suave de Caracteres**: Caracteres apagados, alterados ou removidos via backspace persistem por ~450ms em silhueta de afterglow antes de sumir completamente.
  * **Decaimento ao Limpar a Tela (`clear` / `cls`)**: O conteúdo anterior decai suavemente na tela em 550ms em vez de cortar bruscamente a zero.
  * **Exclusividade do Modo CRT Real**: Ativo estritamente quando o filtro CRT Real está ligado.
  * **Comandos de Terminal**: `ghost on`, `ghost off`, `crt ghost`, `phosphor on/off`.
* **Exibição Edge-to-Edge Limpa (Sem Moldura / Bezel)**: Área útil 100% livre em todos os modos.
* **Efeito das Faixas de Hertz (Varredura Analógica / Roll Bars)**: Passagem de faixas luminosas quase transparentes com opacidade ajustável de 0% a 100%, largura de feixe e velocidade reguláveis. Comandos: `hertz <vel> [largura]`, `hertz suave`, `hertz 60hz`, `hertz off/on`.
* **Tremor da Imagem (Jitter do Tubo CRT)**: Animação CSS de instabilidade do canhão de elétrons, ajustável via pop-up de opções ou comando `jitter on/off`.
* **Controle Dinâmico de Brilho**: Ajuste fino da luminosidade de 70% a 200% (`brightness <valor>`).
* **Curvatura do Tubo Regulável**: Distorção esférica ajustável de 0% a 100% (`curve <0-100>`).
* **Intensidade da Vinheta**: Controle óptico do escurecimento das bordas (`vinheta <0-100|off>`).
* **6 Temas de Cores de Fósforo**:
  * 🟢 **Matrix Green**: O lendário verde fósforo P1 (#00ff66).
  * 🟡 **Amber CRT**: Fósforo âmbar clássico de estações industriais (#ffb000).
  * 🔵 **Neo Cyan**: Azul ciberpunk de alta visibilidade (#00f0ff).
  * 🟣 **Synthwave Magenta**: Rosa néon retrô (#ff0077).
  * ⚪ **Mono White**: Fósforo branco monocromático Paper White de alta nitidez (#f0f4f8).
  * 🔴 **Cyber Red**: Fósforo vermelho tático de combate / visor militar (#ff2a3b).

### 📊 12. Telemetria Real do Sistema (CPU, Memória RAM & Bateria Portátil)
* **Monitoramento em Tempo Real**: Leitura do consumo real de hardware diretamente via Node.js (`os.cpus()`, `os.totalmem()`, `os.freemem()`).
* **Monitor de Status da Bateria (Laptops & Dispositivos Móveis)**: Exibição automática no HUD do percentual de carga, indicador de carregamento AC/USB-C com raio animado e alertas visuais de bateria fraca em dispositivos portáteis via Battery Status API.
### 📱 13. Ergonomia Mobile & Modo Vertical para Celulares Android
* **Barra de Navegação Inferior Mobile**: Navegação ergonômica com abas sensíveis ao toque (`TERMINAL`, `SESSÕES`, `LOGS`, `TECLAS AUX`) projetada especialmente para smartphones segurados na vertical.
* **Barra de Teclas Auxiliares Virtuais (Termux/JuiceSSH Style)**: Trilho de atalhos rápidos essencial para teclados virtuais (Gboard, Samsung Keyboard, etc.):
  * `ESC`: Limpa o comando atual ou cancela operação.
  * `TAB ⇥`: Autocompleta comandos e modelos de equipamentos em tempo real.
  * `^C`: Emite sinal de interrupção imediata (SIGINT) e cancela sessões remotas.
  * `^L`: Limpa o buffer de tela do terminal.
  * `↑` / `↓`: Navega pelo histórico persistente de comandos digitados.
  * `←` / `→`: Move o cursor bloco CRT pelo meio dos caracteres digitados.
  * Caracteres especiais de shell unix/redes com toque direto: `|`, `/`, `-`, `~`, `\`, `.`, `:`, `"`.
  * `ENTER`: Envio tático imediato com feedback tátil.
* **Divisão de Tela Adaptativa (Split Vertical Inteligente)**: No modo vertical/retrato, o Split-Screen assume automaticamente orientação horizontal (telas sobrepostas cima/baixo) para evitar colunas espremidas de 180px.
* **Compatibilidade Safe Area Android**: Respeito automático aos entalhes de câmera (punch-hole) e à barra de gestos do sistema (`env(safe-area-inset)`).

### 🌐 14. Cyber-Net: Navegador Web CRT Embutido *(ALPHA - Em Testes ⚠️)*
> ⚠️ **Status Alpha / Experimental**: A função de navegador integrado está em estágio inicial (Alpha). Muitos sites modernos possuem proteções contra incorporação (`X-Frame-Options`, CSP).
* Navegação web com efeito CRT aplicado em tempo real.
* Comandos rápidos: `browser <url>` ou `youtube <id_ou_link>`.

### ⚡ 15. Terminal Real & Multi-Shell
* Suporte nativo a diferentes interpretadores de comando:
  * **Windows**: PowerShell (`pwsh`) e Prompt de Comando (`cmd.exe`).
  * **Linux / macOS**: Bash (`/bin/bash`), Zsh (`/bin/zsh`) e POSIX Shell (`/bin/sh`).
  * **Android**: POSIX Sh nativo (`/bin/sh` ou shell Android).
* Comunicação bidirecional contínua de baixa latência via **WebSockets (porta 3001)**.
* Histórico de comandos com persistência (`ArrowUp` / `ArrowDown`).

### 📡 16. Protocolos de Rede, Chaves SSH & Autocompletação Inteligente
* **Varredura de Sub-rede ICMP (Ping-Sweep)**: Comando `ping-sweep <sub-rede/CIDR>` (ex: `ping-sweep 192.168.1.0/24`) para mapeamento de dispositivos ativos com IP, RTT, fabricante e MAC.
* **SSH Integrado com Chaves Privadas (PEM / OpenSSH / RSA / Ed25519)**: Conexão direta por senha ou arquivo de chave (`ssh -i chave.pem usuario@host -p 22`).
* **Autocompletação por Equipamento (`[TAB]`)**: Detecção inteligente de comandos para Cisco IOS, MikroTik RouterOS, Huawei VRP, Juniper JunOS e servidores Linux/Windows.
* **Telnet & Raw TCP Socket**: Conexões diretas de socket com dispositivos de rede legados (`telnet host porta`).
* **Ping / ICMP Real**: Testes de alcance de pacotes e latência em milissegundos.
* **Painel de Acessos Rápidos (Quick Sessions)**: Salve conexões frequentes com IP, porta, credenciais e abertura na aba atual ou em nova aba.
* **Auditoria de Logs em Tempo Real**: Telemetria detalhada de eventos de rede, pacotes e conexões com filtros por severidade (`INFO`, `WARN`, `ERROR`, `DATA`, `SUCCESS`).

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
| `split [-h\|-v]` | Ativa/desativa divisão de tela (horizontal `-h` ou vertical `-v`) |
| `broadcast <on\|off>` ou `sync` | Liga/desliga modo sincronizado de digitação simultânea em ambos os terminais |
| `htop` ou `top` | Abre o monitor interativo de processos e CPU estilo HTOP CRT |
| `nano <arquivo>` ou `edit <arquivo>` | Abre o editor de texto estilo GNU nano com sistema virtual de arquivos |
| `cat <arquivo>` | Exibe o conteúdo de um arquivo virtual do sistema na tela |
| `rm <arquivo>` | Remove um arquivo virtual do sistema |
| `nmap <host>` ou `scanport <host>` | Executa varredura de portas TCP no host indicado |
| `traceroute <host>` ou `tracert <host>` | Traça a rota de pacotes e saltos de rede até o host de destino |
| `ping-sweep <subrede/CIDR>` | Mapeia todos os hosts e equipamentos ativos na sub-rede (ex: `192.168.1.0/24`) |
| `export` ou `savelog` | Exporta e baixa o histórico completo da sessão em arquivo `.log` |
| `degauss` | Dispara o efeito de desmagnetização analógica da bobina do tubo CRT |
| `macros` | Exibe ou oculta a barra de botões e macros rápidas de rede |
| `sidebar` | Alterna o recolhimento das barras laterais (maximiza a largura do terminal) |
| `help` | Exibe a lista completa de comandos e sintaxe de uso |
| `[TAB]` | Autocompleta comandos de acordo com o equipamento conectado (Cisco, MikroTik, Linux, etc.) |
| `systeminfo` | Exibe dados do sistema operacional, host e arquitetura (x64) |
| `battery` ou `power` | Exibe telemetria de bateria, percentual, estado de carga AC e autonomia |
| `tab new [nome]` | Abre uma nova aba de terminal para conectar em outro equipamento |
| `tab close` | Fecha a aba ativa atual |
| `tab rename <nome>` | Renomeia o título da aba atual |
| `theme <green\|amber\|cyan\|magenta\|white\|red>` | Altera a cor do fósforo da tela CRT |
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

### ⌨️ Atalhos de Teclado Globais

| Atalho | Ação |
| :--- | :--- |
| `Alt + B` | Recolhe / expande ambos os painéis laterais (área máxima para o terminal) |
| `Alt + ←` ou `Alt + ↑` | Alterna o foco para o **Painel 1** no modo Split-Screen |
| `Alt + →` ou `Alt + ↓` / `Alt + P` | Alterna o foco para o **Painel 2** no modo Split-Screen |
| `Alt + T` | Cria e abre uma nova aba de terminal |
| `Alt + W` | Fecha a aba de terminal ativa |
| `Alt + 1` até `Alt + 9` | Alterna diretamente para a aba de número correspondente |
| `←` / `→` (Setas) | Movimenta o cursor bloco CRT dinamicamente caractere por caractere |
| `Home` / `End` | Salta o cursor diretamente para o início ou fim da linha de comando |
| `↑` / `↓` (Setas) | Navega pelo histórico persistente de comandos executados |
| `Ctrl + C` | Envia interrupção (^C) ou encerra a sessão remota ativa |
| `Ctrl + L` | Limpa o buffer de linhas do terminal |
| `Ctrl + S` | Salva o arquivo no editor de texto GNU nano |
| `Ctrl + X` | Fecha o editor de texto GNU nano |

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

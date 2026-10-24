# Como Iniciar o Cyberdeck Terminal no Windows

Este projeto é composto por duas partes:
1. **Frontend**: Interface visual CRT Cyberpunk (React/Vite ou arquivo HTML avulso).
2. **Backend Node.js (`server-windows-terminal.js`)**: Ponte que executa o PowerShell/CMD real do seu Windows e abre conexões de rede brutas (soquetes TCP com negociação RFC 854 e SSH2) para equipamentos de rede.

---

## Passo 1: Pré-requisitos
Certifique-se de que o **Node.js** está instalado no seu Windows:
* Caso ainda não tenha, baixe a versão **LTS** em: https://nodejs.org/ (basta avançar na instalação padrão).

---

## Passo 2: Método Automático (Recomendado)
Basta dar um duplo clique no arquivo:
👉 **`iniciar-terminal.bat`**

O script irá:
1. Verificar se o Node.js está instalado;
2. Instalar as dependências automaticamente (`npm install --legacy-peer-deps`);
3. Iniciar o servidor em `ws://127.0.0.1:3001`.

---

## Passo 3: Método Manual (Pelo Prompt de Comando ou PowerShell)
Abra o **Prompt de Comando (cmd)** ou o **PowerShell** na pasta do projeto e execute:

```bash
# 1. Instalar dependências:
npm install --legacy-peer-deps

# 2. Iniciar o backend do terminal Windows:
npm run server
# ou diretamente:
node server-windows-terminal.js
```

Você verá a mensagem:
```text
====================================================
 CYBERDECK // WINDOWS TERMINAL NODE.JS BACKEND
 Servidor ouvindo em: ws://127.0.0.1:3001
 Suporte nativo ativo: PowerShell, CMD, TELNET (RFC 854), SSH2
====================================================
Pronto! Aguardando conexões do terminal na porta 3001
```

---

## Passo 4: Abrir a Interface no Navegador
Em outra janela de terminal na mesma pasta:
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

Ou, se preferir usar apenas o arquivo avulso sem rodar o Vite:
Abra diretamente o arquivo `public/assets/aistudio/cyberpunk_crt_terminal_emulator_e48e448a.html` no Google Chrome ou Edge!

---

## Como usar Telnet e SSH:

### 1. Conexão TELNET Real (Switches, Roteadores, OLTs, etc.)
No terminal do Cyberdeck, basta digitar:
```bash
telnet 10.0.72.15
# ou informando a porta explicitamente:
telnet 10.0.72.15 23
```
* O backend abre o soquete TCP e responde automaticamente à negociação RFC 854 do switch;
* O switch enviará o prompt de login (`Username:` e `Password:`);
* Digite seus comandos do switch normalmente (`enable`, `show ip int brief`, `show run`, etc.);
* Para sair, digite `exit` ou aperte `Ctrl + C`.

### 2. Conexão SSH Real
No terminal do Cyberdeck, digite:
```bash
ssh 10.0.72.15
# ou especificando o usuário:
ssh admin@10.0.72.15
# ou com porta:
ssh admin@10.0.72.15 -p 22
```
* O terminal pedirá a senha de forma segura com máscara (`••••••`);
* A sessão segura SSH2 será autenticada e abrirá o shell remoto diretamente na tela;
* Suporta cifras modernas e cifras legadas comuns em switches de rede (3DES, AES-CBC, DH-Group14, etc.);
* Para fechar a sessão, digite `exit` ou aperte `Ctrl + C`.

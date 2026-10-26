# 🌐 Guia de Compilação Multiplataforma (Windows, Linux e macOS)

O projeto **Cyberdeck CRT Terminal** agora é 100% multiplataforma e está totalmente adaptado para ser empacotado em um **executável único** que já inclui tanto a **interface visual CRT** quanto o **backend Node.js de terminal, Telnet e SSH** internamente.

---

## 🚀 1. Compilação Automática pelo GitHub (Recomendado)

Você não precisa ter um computador Mac ou Linux para gerar os executáveis desses sistemas. O GitHub Actions faz isso de forma gratuita e simultânea em servidores reais da Microsoft, Canonical e Apple.

### Passo a Passo:

1. **Envie as alterações para o seu GitHub**:
   ```bash
   git add .
   git commit -m "feat: suporte multiplataforma e electron builder"
   git push origin main
   ```

2. **Gere os executáveis com 1 clique**:
   * Abra o seu repositório no GitHub pelo navegador;
   * Clique na aba **"Actions"** (Ações);
   * Na barra lateral esquerda, clique em **"Build Cross-Platform Cyberdeck"**;
   * Clique no botão cinza à direita: **"Run workflow"** ➔ você pode informar a tag de versão desejada (ex: `v1.0.5`) e confirmar.

3. **O GitHub compilará todos os sistemas em paralelo com a versão exata**:
   * 🪟 **Windows**: `Cyberdeck-CRT-Terminal-<versao>-Setup.exe`, `Cyberdeck-CRT-Terminal-<versao>-Portable.exe` e `Cyberdeck-CRT-Terminal-<versao>-win-x64.zip`.
   * 🐧 **Linux**: `Cyberdeck-CRT-Terminal-<versao>.AppImage`.
   * 🍎 **macOS**: `Cyberdeck-CRT-Terminal-<versao>-x64.dmg` e `Cyberdeck-CRT-Terminal-<versao>-x64.zip`.
   * 📱 **Android**: `Cyberdeck-CRT-Terminal-<versao>.apk`.

4. **Como Baixar os Arquivos Prontos**:
   * Todos os binários são publicados automaticamente na aba **Releases** do repositório já com seus nomes contendo a versão exata da compilação!
   * Também ficam disponíveis como download temporário na seção **Artifacts** da execução.

---

## 🏷️ 2. Criar uma Release Oficial no GitHub por Tag

Se preferir versionar por tag git no seu terminal:
```bash
git tag v1.0.5
git push origin v1.0.5
```
O GitHub Actions detectará a tag `v1.0.5`, sincronizará a versão `1.0.5` em todos os executáveis, fará a compilação completa e publicará automaticamente a **Release v1.0.5** com todos os arquivos nomeados com `1.0.5`.

---

## 💻 3. Como Definir Versão e Compilar Localmente

Para sincronizar a versão antes de compilar no seu PC:
```bash
npm run version:set 1.0.5
```
Isso atualiza simultaneamente o `package.json` e o `android/app/build.gradle`.

### No Windows:
```bash
npm run package:win
```
*O instalador e o executável portátil serão salvos na pasta `release/` com o nome `Cyberdeck-CRT-Terminal-1.0.5-...`.*

### No Linux:
```bash
npm run package:linux
```
*O `.AppImage` e o `.deb` serão salvos na pasta `release/`.*

### No macOS:
```bash
npm run package:mac
```
*O `.dmg` e o `.zip` serão salvos na pasta `release/`.*

---

## ⚙️ 4. O que foi adaptado no código?

1. **Executável Único com Backend Integrado (`electron/main.cjs`)**:
   Ao abrir o `.exe`, `.AppImage` ou `.dmg`, o executável inicia o servidor do terminal em segundo plano e abre a tela CRT imediatamente, sem que o usuário precise abrir telas pretas ou rodar scripts avulsos.

2. **Engine Terminal Universal (`server-terminal.js`)**:
   - **No Windows**: Executa PowerShell (`powershell.exe`) ou Prompt de Comando (`cmd.exe`).
   - **No Linux**: Executa Bash (`/bin/bash`) ou a shell padrão do sistema.
   - **No macOS**: Executa Zsh (`/bin/zsh`) ou Bash.
   - Suporte nativo mantido a conexões Telnet com negociação RFC 854 e SSH2 interativo.

3. **Compatibilidade Preservada**:
   - Usuários de Windows que preferem rodar via terminal continuam podendo usar `iniciar-terminal.bat`.
   - Usuários de Linux/macOS podem usar o novo `iniciar-terminal.sh`.
   - A versão Web via navegador (`npm run dev`) continua funcionando normalmente.

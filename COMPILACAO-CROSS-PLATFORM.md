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
   * Clique no botão cinza à direita: **"Run workflow"** ➔ Selecione o branch `main` e confirme.

3. **O GitHub compilará os 3 sistemas em paralelo**:
   * 🪟 **Windows**: Cria o instalador `Cyberdeck CRT Terminal-Setup-1.0.0.exe` e a versão portátil `.exe`.
   * 🐧 **Linux**: Cria o executável autônomo `Cyberdeck CRT Terminal-1.0.0.AppImage` e o instalador Debian/Ubuntu `.deb`.
   * 🍎 **macOS**: Cria o instalador de disco `Cyberdeck CRT Terminal-1.0.0.dmg` e o `.zip`.

4. **Como Baixar os Arquivos Prontos**:
   * Assim que os 3 blocos ficarem verdes (sucesso), clique na execução concluída;
   * Na seção **Artifacts** (Artefatos) no final da página, você verá os links de download direto para cada sistema operacional!

---

## 🏷️ 2. Criar uma Release Oficial no GitHub (Opcional)

Se você preferir que os executáveis fiquem publicados na aba pública de **Releases** do seu GitHub para qualquer pessoa baixar:

Basta criar uma tag de versão no seu terminal local:
```bash
git tag v1.0.0
git push origin v1.0.0
```
O GitHub Actions detectará a tag `v1.0.0`, fará a compilação completa e publicará automaticamente a **Release v1.0.0** com todos os binários anexados.

---

## 💻 3. Como Compilar Localmente (No seu próprio PC)

Se você quiser gerar o executável localmente:

### No Windows:
```bash
npm run package:win
```
*O instalador e o executável portátil serão salvos na pasta `release/`.*

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

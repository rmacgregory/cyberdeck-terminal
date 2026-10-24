# 📱 Guia de Compilação e Uso no Android (Tablet & Smartphone)

O **Cyberdeck CRT Terminal** agora conta com integração nativa com o **Capacitor**, permitindo ser empacotado em um aplicativo nativo Android único (`.apk`) com aceleração gráfica, visual CRT completo e multi-abas simultâneas.

---

## ⚡ 1. Opção Mais Fácil: Baixar o `.apk` direto do GitHub Actions

Você não precisa instalar o Android Studio no seu computador se não quiser! O fluxo do GitHub Actions foi configurado para compilar o APK automaticamente:

1. Suba as alterações para o seu repositório Git:
   ```bash
   git add .
   git commit -m "feat: adicionar suporte nativo android via capacitor com barra touch para tablet"
   git push origin main
   ```
2. No GitHub, vá na aba **Actions** → selecione **Build Cross-Platform Cyberdeck** → clique em **Run workflow**.
3. O GitHub Actions irá compilar automaticamente:
   - 🪟 Windows (`.exe` instalador, `.exe` portátil e `.zip` 64-bit)
   - 🐧 Linux (`.AppImage`)
   - 🍏 macOS (`.dmg` e `.zip`)
   - 📱 **Android (`Cyberdeck-Terminal-Android-debug.apk`)**
4. Ao término da execução, baixe o arquivo `Cyberdeck-Android-APK` ou acesse a aba **Releases** do repositório para baixar o arquivo `.apk` diretamente para o seu tablet!

---

## 📲 2. Instalando no seu Tablet Android

1. Transfira o arquivo `.apk` baixado para o seu tablet (por Google Drive, cabo USB, WhatsApp Web, etc.).
2. No tablet, toque no arquivo `.apk`.
3. Se o Android perguntar, permita a instalação de aplicativos de fontes confiáveis/navegador.
4. Conclua a instalação e abra o **Cyberdeck CRT Terminal**!

---

## 🛠️ 3. Compilando Localmente (Opcional)

Se você tiver o ambiente Android instalado (Android Studio ou SDK):

```bash
# 1. Compilar o frontend e sincronizar com o projeto Android
npm run cap:build

# 2. Abrir o projeto no Android Studio (para rodar no emulador ou depurar via USB)
npm run cap:open

# 3. Ou compilar diretamente o APK pelo terminal (requer Java 17+ instalado):
npm run build:android
```
O `.apk` gerado ficará em:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🌐 4. Conectando o Tablet ao seu PC ou Equipamentos de Rede

- **Conexão Direta**: No tablet conectado ao mesmo Wi-Fi do seu roteador ou computador, você pode conectar via SSH ou Telnet para qualquer IP da rede local (ex: `ssh pi@192.168.1.50` ou `telnet 192.168.1.1`).
- **Conectando ao Terminal do Windows (Servidor)**: Caso queira controlar o seu PC Windows pelo tablet, basta iniciar o `server-windows-terminal.js` no seu PC e conectar a aba do terminal no tablet apontando para o IP do seu computador na rede local (`ws://192.168.x.x:3001`). O app já foi configurado com permissão `usesCleartextTraffic="true"` no Android para aceitar conexões locais HTTP e WebSocket.

# 🍎 Guia de Instalação e Execução no macOS (Apple Silicon & Intel)

Este guia explica como instalar e executar o **Cyberdeck CRT Terminal** no seu Mac (seja com chip **Apple Silicon M1/M2/M3/M4** ou **Intel**).

---

## ⚡ 1. Escolhendo o Pacote Correto

Na aba [**Releases**](https://github.com/rmacgregory/cyberdeck-terminal/releases), você encontrará as seguintes opções para macOS:

| Arquivo | Compatibilidade | Descrição |
| :--- | :--- | :--- |
| **`Cyberdeck-CRT-Terminal-*-arm64.dmg`** | **Apple Silicon (M1/M2/M3/M4)** | Imagem de disco (.dmg) nativa com máxima performance para Apple Silicon. |
| **`Cyberdeck-CRT-Terminal-*-x64.dmg`** | **Mac Intel** | Imagem de disco (.dmg) nativa para computadores Mac com processador Intel. |
| **`Cyberdeck-CRT-Terminal-*-arm64.zip`** | **Apple Silicon (M1/M2/M3/M4)** | Pacote portátil compactado para Apple Silicon. |
| **`Cyberdeck-CRT-Terminal-*-x64.zip`** | **Mac Intel** | Pacote portátil compactado para Mac Intel. |

---

## 🔒 2. Como Abrir no macOS (Aviso de "App Danificado" ou "Desenvolvedor Não Identificado")

Como este é um projeto open-source comunitário e **não possui certificado corporativo pago de desenvolvedor da Apple ($99/ano)**, o macOS ativa a proteção padrão do **Gatekeeper** para qualquer aplicativo baixado da internet (GitHub).

Ao tentar abrir com duplo clique pela primeira vez, o macOS pode exibir uma das mensagens abaixo:
- *"Cyberdeck CRT Terminal está danificado e não pode ser aberto. Você deve movê-lo para o Lixo."*
- *"Cyberdeck CRT Terminal não pode ser aberto porque a Apple não pode verificar se há software malicioso."*

> 💡 **Isso é completamente normal no macOS para softwares open-source.** O app **não está danificado**. O macOS apenas coloca uma etiqueta de quarentena (`com.apple.quarantine`) em arquivos baixados pelo navegador.

---

### ✅ Método 1: Abrir pelo Finder (Mais Rápido - Sem Terminal)

1. Abra a pasta **Aplicativos** (ou onde você colocou o app).
2. Clique no ícone do **Cyberdeck CRT Terminal** com o **botão direito do mouse** (ou segure a tecla `Control` e clique).
3. Selecione **"Abrir"** no menu de contexto.
4. Na janela de confirmação que abrir, clique no botão **"Abrir"**.
5. Pronto! O macOS registrará a autorização permanente e nas próximas vezes você poderá abrir com duplo clique normal.

---

### ✅ Método 2: Remover o bloqueio de quarentena via Terminal (1 linha de comando)

Se o Método 1 não liberar, abra o aplicativo **Terminal** do seu Mac (`Cmd + Espaço`, digite `Terminal`) e cole o seguinte comando:

```bash
xattr -cr "/Applications/Cyberdeck CRT Terminal.app"
```

*(Se você ainda não moveu para a pasta Aplicativos e o app está nos Downloads, execute:)*
```bash
xattr -cr ~/Downloads/"Cyberdeck CRT Terminal.app"
```

O comando `xattr -cr` remove instantaneamente o atributo de quarentena do macOS e o aplicativo abrirá imediatamente!

---

### ✅ Método 3: Liberar nas Configurações do Sistema

1. Abra **Ajustes do Sistema** (System Settings).
2. Vá em **Privacidade e Segurança** (Privacy & Security).
3. Role para baixo até a seção **Segurança**.
4. Você verá uma mensagem: *"Cyberdeck CRT Terminal foi impedido de abrir porque não é de um desenvolvedor identificado"*.
5. Clique no botão **"Abrir Mesmo Assim"** (Open Anyway) e digite sua senha ou use o Touch ID.

---

## 🛠️ Atalhos Úteis no Mac

- **Copiar**: `Cmd + C` (ou seleção de texto automática)
- **Colar**: `Cmd + V`
- **Alternar Tela Cheia**: `Cmd + Ctrl + F`
- **Recarregar**: `Cmd + R`
- **Encerrar**: `Cmd + Q`

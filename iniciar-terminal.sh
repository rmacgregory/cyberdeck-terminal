#!/usr/bin/env bash
# ========================================================
# CYBERDECK // UNIVERSAL TERMINAL BACKEND (Linux / macOS)
# Inicia a bridge Node.js para Shell nativo, TELNET e SSH
# ========================================================

set -e

# Cores no terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}====================================================${NC}"
echo -e "${GREEN} CYBERDECK // TERMINAL BACKEND (Linux / macOS)${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Verifica Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERRO] Node.js não foi encontrado no sistema.${NC}"
    echo "Instale o Node.js v18+ usando seu gerenciador de pacotes (brew, apt, pacman, etc.)."
    exit 1
fi

# 2. Instala dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}[*] Instalando dependências do projeto...${NC}"
    npm install --legacy-peer-deps
fi

# 3. Inicia o backend
echo -e "${GREEN}[*] Iniciando servidor do terminal em ws://127.0.0.1:3001 ...${NC}"
echo -e "${CYAN}Pressione Ctrl+C para encerrar.${NC}"
echo ""

node server-terminal.js

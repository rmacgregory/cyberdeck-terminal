@echo off
title CYBERDECK // WINDOWS TERMINAL BACKEND
color 0A
cls
echo ========================================================
echo   CYBERDECK // WINDOWS TERMINAL BACKEND
echo   Iniciando Bridge Node.js para PowerShell e Sockets TCP...
echo ========================================================
echo.

:: 1. Verifica se o Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] O Node.js nao foi encontrado no seu computador!
    echo Por favor, instale o Node.js LTS baixando em: https://nodejs.org/
    echo Apos instalar, execute este arquivo novamente.
    echo.
    pause
    exit /b 1
)

:: 2. Instala dependencias se a pasta node_modules nao existir
if not exist "node_modules\" (
    echo [*] Instalando dependencias do projeto pela primeira vez...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        color 0C
        echo [ERRO] Falha ao instalar as dependencias via npm.
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas com sucesso!
    echo.
)

:: 3. Inicia o backend do terminal
echo [*] Iniciando servidor do terminal em ws://127.0.0.1:3001 ...
echo [*] Conecte sua interface web (ou abra index.html / npm run dev).
echo.
echo Para fechar o backend a qualquer momento, aperte CTRL + C.
echo ========================================================
echo.

node server-windows-terminal.js

pause

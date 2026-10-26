#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawVersion = process.argv[2];
if (!rawVersion) {
  console.error('Uso: node scripts/set-version.js <versao> (ex: 1.0.1 ou v1.0.1)');
  process.exit(1);
}

// Remove prefixo 'v' se houver
let version = rawVersion.replace(/^v/, '').trim();

// Garante formato SemVer válido de 3 componentes (MAJOR.MINOR.PATCH) exigido pelo electron-builder
const parts = version.split('.');
if (parts.length > 3) {
  // Se vierem 4 partes como 1.0.0.10, condensa para 1.0.10
  version = `${parts[0]}.${parts[1]}.${parts[parts.length - 1]}`;
} else if (parts.length === 2) {
  version = `${parts[0]}.${parts[1]}.0`;
} else if (parts.length === 1) {
  version = `${parts[0]}.0.0`;
}

console.log(`\nSincronizando versão SemVer [${version}] em todos os arquivos de build...`);

// 1. Atualizar package.json
const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✔ package.json atualizado para ${version}`);
}

// 2. Atualizar android/app/build.gradle (versionName)
const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  gradle = gradle.replace(
    /versionName\s+project\.hasProperty\('versionName'\)\s*\?\s*project\.property\('versionName'\)\s*:\s*"[^"]*"/,
    `versionName project.hasProperty('versionName') ? project.property('versionName') : "${version}"`
  );
  fs.writeFileSync(gradlePath, gradle, 'utf8');
  console.log(`✔ android/app/build.gradle atualizado com versionName "${version}"`);
}

console.log(`✔ Todos os arquivos de compilação agora usam a versão: ${version}\n`);

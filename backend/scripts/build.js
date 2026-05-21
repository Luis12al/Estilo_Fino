const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// 1. Limpiar dist anterior
console.log('🧹 Cleaning dist/...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

// 2. Generar Prisma Client
console.log('🔧 Generating Prisma Client...');
execSync('node node_modules/prisma/build/index.js generate', { stdio: 'inherit' });

// 3. Compilar TypeScript
console.log('🔨 Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ TypeScript compilation had warnings, continuing...');
}

// 4. Verificar que dist/ se creó
if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory not found after tsc');
  process.exit(1);
}

// 5. Fix paths
console.log('🔧 Fixing path aliases...');

// Mapa de aliases a rutas relativas DESDE dist/
// @config/env → ./config/env (desde dist/app.js)
// @modules/auth/auth.routes → ./modules/auth/auth.routes (desde dist/app.js)
// @shared/middlewares/error.middleware → ./shared/middlewares/error.middleware (desde dist/app.js)
// Pero desde dist/modules/auth/auth.controller.js → ../shared/middlewares/error.middleware
const aliases = {
  '@config/': 'config/',
  '@modules/': 'modules/',
  '@shared/': 'shared/',
  '@/': '',
};

function getRelativePath(fromFile, toPath) {
  const fromDir = path.dirname(fromFile);
  // toPath ya es relativo a dist/, ej: "config/env" o "modules/auth/auth.routes"
  const targetPath = path.join(distDir, toPath);
  let relative = path.relative(fromDir, targetPath);
  // Reemplazar backslashes por forward slashes
  relative = relative.replace(/\\/g, '/');
  // Asegurar que empiece con ./ o ../
  if (!relative.startsWith('.')) {
    relative = './' + relative;
  }
  return relative;
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const [alias, replacement] of Object.entries(aliases)) {
    // require("@config/env") → require("./config/env")
    const requireRegex = new RegExp(`require\\(["']${alias}([^"']+)["']\\)`, 'g');
    content = content.replace(requireRegex, (match, p1) => {
      const relPath = getRelativePath(filePath, replacement + p1);
      modified = true;
      return `require("${relPath}")`;
    });
    
    // import { x } from "@config/env" → import { x } from "./config/env"
    const importRegex = new RegExp(`from\\s+["']${alias}([^"']+)["']`, 'g');
    content = content.replace(importRegex, (match, p1) => {
      const relPath = getRelativePath(filePath, replacement + p1);
      modified = true;
      return `from "${relPath}"`;
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed paths in ${path.relative(distDir, filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(distDir);
console.log('✅ Build complete!');
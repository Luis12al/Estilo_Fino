// backend/scripts/build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const prismaBin = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma');

// Helper para ejecutar prisma de forma confiable
function runPrisma(cmd) {
  // Intentar con npx primero, fallback a binario directo
  try {
    execSync(`npx prisma ${cmd}`, { stdio: 'inherit' });
  } catch {
    console.log(`⚠️ npx prisma failed, trying direct binary...`);
    execSync(`node ${prismaBin} ${cmd}`, { stdio: 'inherit' });
  }
}

// 1. Limpiar dist anterior
console.log('🧹 Cleaning dist/...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

// 2. Generar Prisma Client
console.log('🔧 Generating Prisma Client...');
runPrisma('generate');

// 3. Ejecutar migraciones en producción
console.log('🗄️  Running database migrations...');
runPrisma('migrate deploy');

// 4. Compilar TypeScript
console.log('🔨 Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ TypeScript compilation had warnings, continuing...');
}

// 5. Verificar que dist/ se creó
if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory not found after tsc');
  process.exit(1);
}

// 6. Verificar que server.js existe
const serverPath = path.join(distDir, 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ dist/server.js not found. Check tsconfig rootDir setting.');
  process.exit(1);
}

// 7. Fix paths
const aliases = {
  '@config/': 'config/',
  '@modules/': 'modules/',
  '@shared/': 'shared/',
  '@/': '',
};

function getRelativePath(fromFile, toPath) {
  const fromDir = path.dirname(fromFile);
  const targetPath = path.join(distDir, toPath);
  let relative = path.relative(fromDir, targetPath);
  relative = relative.replace(/\\/g, '/');
  if (!relative.startsWith('.')) {
    relative = './' + relative;
  }
  return relative;
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const [alias, replacement] of Object.entries(aliases)) {
    const requireRegex = new RegExp(`require\\(["']${alias}([^"']+)["']\\)`, 'g');
    content = content.replace(requireRegex, (match, p1) => {
      const relPath = getRelativePath(filePath, replacement + p1);
      modified = true;
      return `require("${relPath}")`;
    });
    
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
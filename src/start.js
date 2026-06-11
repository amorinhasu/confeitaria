const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const packageJson = require('../package.json');

function dependencyPackagePath(dependencyName) {
  return path.join(projectRoot, 'node_modules', ...dependencyName.split('/'), 'package.json');
}

function missingDependencies() {
  return Object.keys(packageJson.dependencies || {}).filter((dependencyName) => !fs.existsSync(dependencyPackagePath(dependencyName)));
}

const missing = missingDependencies();
if (missing.length) {
  console.warn(`[Momozin] Dependências ausentes no ambiente: ${missing.join(', ')}. Executando npm install antes de iniciar.`);
  execFileSync('npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}

require('./index');

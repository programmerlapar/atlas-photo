import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(
  readFileSync(resolve(projectRoot, 'package.json'), 'utf8')
);
const electronBuilderConfig = JSON.parse(
  readFileSync(resolve(projectRoot, 'electron-builder.json'), 'utf8')
);
const mainEntry = resolve(projectRoot, packageJson.main);
const preloadEntry = resolve(projectRoot, 'dist-electron/preload/index.js');
const rendererEntry = resolve(projectRoot, 'dist-electron/renderer/index.html');
const faceModelFiles = [
  'blazeface.json',
  'blazeface.bin',
  'faceres.json',
  'faceres.bin',
];

if (!existsSync(mainEntry)) {
  throw new Error(`Missing packaged main entry: ${mainEntry}`);
}

if (!existsSync(preloadEntry)) {
  throw new Error(`Missing packaged preload bridge: ${preloadEntry}`);
}

if (!existsSync(rendererEntry)) {
  throw new Error(`Missing packaged renderer entry: ${rendererEntry}`);
}
if (!electronBuilderConfig.files.includes('public/**/*')) {
  throw new Error('Electron builder config does not include public model assets');
}

for (const filename of faceModelFiles) {
  const rendererModel = resolve(
    projectRoot,
    'dist-electron/renderer/models/human',
    filename
  );
  const packagedModel = resolve(projectRoot, 'public/models/human', filename);
  if (!existsSync(rendererModel) || !existsSync(packagedModel)) {
    throw new Error(`Missing bundled face model asset: ${filename}`);
  }
}

const mainBundle = readFileSync(mainEntry, 'utf8');
const preloadReference = mainBundle.match(
  /const preloadPath = path\.join\(__dirname,\s*["']([^"']+)["']\)/
);

if (!preloadReference) {
  throw new Error('Packaged main bundle does not configure a preload path');
}

const configuredPreloadEntry = resolve(dirname(mainEntry), preloadReference[1]);
if (configuredPreloadEntry !== preloadEntry) {
  throw new Error(
    `Packaged preload path mismatch: configured ${configuredPreloadEntry}, expected ${preloadEntry}`
  );
}

const preloadBundle = readFileSync(preloadEntry, 'utf8');
if (
  !/contextBridge\.exposeInMainWorld\(["']electronAPI["']/.test(preloadBundle)
) {
  throw new Error('Packaged preload bundle does not expose electronAPI');
}

console.log('Packaged Electron artifact smoke test passed');

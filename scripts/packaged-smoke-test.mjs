import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(
  readFileSync(resolve(projectRoot, 'package.json'), 'utf8')
);
const mainEntry = resolve(projectRoot, packageJson.main);
const preloadEntry = resolve(projectRoot, 'dist-electron/preload/index.js');
const rendererEntry = resolve(projectRoot, 'dist-electron/renderer/index.html');
const unpackedSharpPackagesDir = resolve(
  projectRoot,
  'release/linux-unpacked/resources/app.asar.unpacked/node_modules/@img'
);

if (!existsSync(mainEntry)) {
  throw new Error(`Missing packaged main entry: ${mainEntry}`);
}

if (!existsSync(preloadEntry)) {
  throw new Error(`Missing packaged preload bridge: ${preloadEntry}`);
}

if (!existsSync(rendererEntry)) {
  throw new Error(`Missing packaged renderer entry: ${rendererEntry}`);
}

const hasUnpackedLibvips =
  existsSync(unpackedSharpPackagesDir) &&
  readdirSync(unpackedSharpPackagesDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith('sharp-libvips-')
    )
    .some((packageEntry) => {
      const libDir = resolve(
        unpackedSharpPackagesDir,
        packageEntry.name,
        'lib'
      );

      return (
        existsSync(libDir) &&
        readdirSync(libDir).some((entry) => entry.startsWith('libvips-cpp.so.'))
      );
    });

if (process.platform === 'linux' && !hasUnpackedLibvips) {
  throw new Error(
    `Missing unpacked sharp libvips binary: ${unpackedSharpPackagesDir}`
  );
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

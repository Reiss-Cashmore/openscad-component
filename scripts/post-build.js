#!/usr/bin/env node

// Post-build script to prepare the dist folder for NPM
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the main package.json
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));

// Create a minimal package.json for dist
// Note: Remove './dist/' prefix from paths since we're inside dist/
const distPkg = {
  name: pkg.name,
  version: pkg.version,
  type: pkg.type,
  description: pkg.description,
  keywords: pkg.keywords,
  author: pkg.author,
  license: pkg.license,
  repository: pkg.repository,
  main: './index.cjs',
  module: './index.js',
  types: './index.d.ts',
  exports: {
    ".": {
      "types": "./index.d.ts",
      "import": "./index.js",
      "require": "./index.cjs"
    },
    "./worker": {
      "types": "./openscad-worker.d.ts",
      "import": "./openscad-worker.js"
    },
    "./styles": "./style.css"
  },
  peerDependencies: pkg.peerDependencies,
  dependencies: pkg.dependencies
};

// Write to dist
writeFileSync(
  resolve(__dirname, '../dist/package.json'),
  JSON.stringify(distPkg, null, 2) + '\n'
);

// Copy README if it exists
try {
  copyFileSync(
    resolve(__dirname, '../README.md'),
    resolve(__dirname, '../dist/README.md')
  );
  console.log('✓ Copied README.md to dist/');
} catch (err) {
  console.log('⚠ No README.md to copy');
}

// Copy built worker and its dependencies to public for demo app
try {
  const { readdirSync, rmSync } = await import('fs');
  const publicDir = resolve(__dirname, '../public');
  const distDir = resolve(__dirname, '../dist');
  const chunkPattern = /^(filesystem|utils|zip-archives)-[\w-]+\.js$/;
  
  // Copy worker
  copyFileSync(
    resolve(distDir, 'openscad-worker.js'),
    resolve(publicDir, 'openscad-worker.js')
  );
  
  // Clean old chunks from public to avoid stale references
  for (const file of readdirSync(publicDir)) {
    if (chunkPattern.test(file)) {
      rmSync(resolve(publicDir, file));
    }
  }
  
  // Copy fresh chunk files that the worker might need (filesystem, utils, zip-archives)
  for (const file of readdirSync(distDir)) {
    if (chunkPattern.test(file)) {
      copyFileSync(
        resolve(distDir, file),
        resolve(publicDir, file)
      );
      console.log(`✓ Copied ${file} to public/`);
    }
  }
  
  console.log('✓ Copied openscad-worker.js and dependencies to public/');
} catch (err) {
  console.log('⚠ Failed to copy worker:', err.message);
}

console.log('✓ Created dist/package.json');

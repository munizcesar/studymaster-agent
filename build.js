/**
 * Build script for the Aivo mascot React bundle.
 * Bundles React + framer-motion + lucide-react + Aivo engine into one JS file.
 * Injects the current git commit hash as a version banner.
 *
 * Entry point: src/aivo/engine/boot.ts  (auto-boot, single root, single render)
 */
const esbuild = require('esbuild');
const { execSync } = require('child_process');
const fs = require('fs');

// Get the current git commit hash
let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  console.warn('⚠️ Could not determine git commit hash');
}

const versionBanner = `/* AIVO Mascot Bundle - commit ${commitHash} */\n`;
const versionAssign = `;window.__AIVO_COMMIT_HASH__='${commitHash}';`;

esbuild.build({
  entryPoints: ['src/aivo/core/boot.tsx'],
  bundle: true,
  outfile: 'dist/aivo-mascot-bundle.js',
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  loader: {
    '.jsx': 'jsx',
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
  jsx: 'automatic',
  jsxImportSource: 'react',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  banner: {
    js: versionBanner,
  },
  minify: true,
  treeShaking: true,
  sourcemap: false,
}).then(() => {
  // Append version assignment right after the IIFE
  const bundleContent = fs.readFileSync('dist/aivo-mascot-bundle.js', 'utf8');
  fs.writeFileSync('dist/aivo-mascot-bundle.js', bundleContent + versionAssign);
  console.log('✅ Aivo mascot bundle built: dist/aivo-mascot-bundle.js');
  console.log('📌 Commit:', commitHash);
}).catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

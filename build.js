/**
 * Build script for the Aivo mascot React bundle.
 * Bundles React + framer-motion + lucide-react + Aivo into one JS file.
 */
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/aivo-integration.jsx'],
  bundle: true,
  outfile: 'dist/aivo-mascot-bundle.js',
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  loader: { '.jsx': 'jsx' },
  jsx: 'automatic',
  jsxImportSource: 'react',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: true,
  treeShaking: true,
  sourcemap: false,
}).then(() => {
  console.log('✅ Aivo mascot bundle built: dist/aivo-mascot-bundle.js');
}).catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

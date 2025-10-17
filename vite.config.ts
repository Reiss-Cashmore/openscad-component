import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  const isLibraryBuild = command === 'build';

  return {
    plugins: [
      react(),
      ...(isLibraryBuild ? [
        dts({
          insertTypesEntry: true,
          include: ['src/**/*.ts', 'src/**/*.tsx'],
          exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'demo/**', 'test-app/**']
        })
      ] : [])
    ],

    build: isLibraryBuild ? {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          'openscad-worker': resolve(__dirname, 'src/runner/openscad-worker.ts')
        },
        name: 'OpenSCADPlayground',
        formats: ['es', 'cjs']
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime'
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'react/jsx-runtime'
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'style.css';
            return assetInfo.name || '';
          }
        }
      },
      sourcemap: true,
      minify: 'esbuild',
      target: 'es2022'
    } : {
      outDir: 'demo-dist'
    },

    // For demo development
    root: isLibraryBuild ? undefined : resolve(__dirname, 'demo'),
    publicDir: resolve(__dirname, 'public'),

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },

    optimizeDeps: {
      include: [
        'monaco-editor/esm/vs/editor/editor.api'
      ]
    },

    worker: {
      format: 'es'
    },

    server: {
      port: 3000
    }
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isDemoBuild = mode === 'demo';
  const isLibraryBuild = command === 'build' && !isDemoBuild;

  return {
    base: isDemoBuild ? process.env.DEMO_BASE ?? '/' : undefined,
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
        output: [
          {
            format: 'es',
            entryFileNames: '[name].js',
            chunkFileNames: '[name]-[hash].js',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'react/jsx-runtime'
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') return 'openscad-playground.css';
              return assetInfo.name || '';
            }
          },
          {
            format: 'cjs',
            entryFileNames: '[name].cjs',
            chunkFileNames: '[name]-[hash].cjs',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'react/jsx-runtime'
            },
          }
        ]
      },
      sourcemap: true,
      minify: 'esbuild',
      target: 'es2022'
    } : {
      outDir: 'demo-dist',
      emptyOutDir: true
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

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  // root: 'src/webviews',
  plugins: [react()],
  publicDir: 'src/webviews/public',
  resolve: {
    alias: {
      uiSrc: fileURLToPath(new URL('./src/webviews/src', import.meta.url)),
      testSrc: fileURLToPath(new URL('./src/webviews/test', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist/webviews',
    target: 'esnext',
    minify: 'esbuild',
    lib: {
      entry: path.resolve(__dirname, './src/webviews/src/index.tsx'),
      name: 'VSWebview',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     return id.toString().split('node_modules/')[1].split('/')[0].toString()
        //   }
        // },
      },
    },
    watch: {}, // yes, this is correct
  },
  define: {
    'process.env': JSON.stringify(process.platform),
  },

  // testing
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/webviews/test/setup.ts'],
  },
})

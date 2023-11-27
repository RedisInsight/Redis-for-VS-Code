import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [react(), htmlPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(
              __dirname,
              './backend_dist/redis-backend-win32-x64.zip',
            ),
          ),
          dest: normalizePath(path.resolve(__dirname, './dist/server')),
        },
      ],
    }),
  ],
  publicDir: './src/webviews/public',
  resolve: {
    alias: {
      uiSrc: fileURLToPath(new URL('./src/webviews/src', import.meta.url)),
      testSrc: fileURLToPath(new URL('./src/webviews/test', import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
  envPrefix: 'RI_',
  build: {
    outDir: './dist/webviews',
    target: 'es2020',
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
      },
    },
    watch: {}, // yes, this is correct
  },
  define: {
    'process.env': JSON.stringify(process.platform),
  },

  // vitest testing
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/webviews/test/setup.ts'],
    coverage: {
      statements: 80,
      lines: 80,
      branches: 70,
      functions: 60,
    },
  },
})

// Change default route from root to our index.html
function htmlPlugin() {
  return {
    name: 'deep-index',
    configureServer(server) {
      server.middlewares.use((req, _, next) => {
        req.url = req.url === '/' ? './src/webviews/index.html' : req.url
        next()
      })
    },
  }
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
// import compression from 'vite-plugin-compression2'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    react(),
    htmlPlugin(),
    closePlugin(),
    svgr(),
    reactClickToComponent(),
    // compression({
    //   algorithm: 'gzip', exclude: [/\.(br)$ /, /\.(gz)$/],
    // }),
    // compression({
    //   algorithm: 'brotliCompress', exclude: [/\.(br)$ /, /\.(gz)$/],
    // }),
  ],
  publicDir: './src/webviews/public',
  resolve: {
    alias: {
      lodash: 'lodash-es',
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
    testTimeout: 20000,
    setupFiles: ['./src/webviews/test/setup.ts'],
    coverage: {
      include: ['src/webviews/src/**'],
      exclude: [
        'src/webviews/src/**/index.ts',
        'src/webviews/src/**/*.d.ts',
        'src/webviews/src/**/interface.ts',
        'src/webviews/src/**/*.stories.*',
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        branches: 70,
        functions: 60,
      },
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

// Exit from watch mode for prepublish build
function closePlugin() {
  return {
    name: 'ClosePlugin',
    buildEnd(error) {
      if (error) {
        console.error(error)
        process.exit(1)
      }
    },
    closeBundle() {
      if (process.env.BUILD_EXIT === 'true') {
        process.exit(0)
      }
    },
  }
}

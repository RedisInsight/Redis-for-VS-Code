import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import * as dotenv from 'dotenv'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
// import compression from 'vite-plugin-compression2'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '.env') })

const isProduction = process.env.NODE_ENV === 'production'
const nodeEnv = isProduction ? 'production' : 'development'

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
    viteStaticCopy({
      targets: [
        {
          src: './src/resources',
          dest: './',
        },
      ],
    }),
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
    fs: {
      allow: ['./'],
    },
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
    'process.env': isProduction ? JSON.stringify(process.platform) : {},
    'process.env.NODE_ENV': `"${nodeEnv}"`,
  },

  // vitest testing
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 20000,
    setupFiles: ['./src/webviews/test/setup.ts'],
    coverage: {
      enabled: true,
      reporter: 'html',
      reportsDirectory: './report/coverage',
      include: ['src/webviews/src/**'],
      exclude: [
        'src/webviews/src/**/index.ts',
        'src/webviews/src/**/*.d.ts',
        'src/webviews/src/**/interface.ts',
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        branches: 70,
        functions: 60,
      },
    },
    server: {
      deps: {
        inline: ['rawproto', 'react-monaco-editor'],
      },
    },
    reporters: [
      'default',
      [
        'junit',
        {
          outputFile: './reports/junit.xml',
        },
      ],
      [
        'html',
        {
          outputFile: './report/index.html',
        },
      ],
    ],
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

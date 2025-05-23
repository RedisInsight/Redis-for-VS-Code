import {
  DEFAULT_STORAGE_FOLDER,
  ExTester,
  ReleaseQuality,
} from 'vscode-extension-tester'
import { logging } from 'selenium-webdriver'
import * as fs from 'fs'
import path = require('path')
import { Config } from './helpers/Conf'
import { VScodeScripts } from './helpers/scripts/vscodeScripts'
;(async (): Promise<void> => {
  try {
    // Delete mochawesome-report directory
    const reportDir = path.join(__dirname, '..', 'mochawesome-report')
    if (fs.existsSync(reportDir)) {
      fs.rmSync(reportDir, { recursive: true })
    }

    const isLocalRun = !!process.env.LOCAL_RUN

    const storageFolder = !isLocalRun
      ? DEFAULT_STORAGE_FOLDER
      : path.join(__dirname, '..', 'test-resources')

    const exTester = new ExTester(
      storageFolder,
      ReleaseQuality.Stable,
      './test-extensions',
    )
    const extensionDir = path.join(
      __dirname,
      '..',
      'test-extensions',
      `${Config.extensionName.replace('.vsix', '')}`,
    )
    const extensionProcessPath = path.join(
      __dirname,
      '..',
      'test-extensions',
      'redis.redis-for-vscode-1.2.0',
      'dist',
      'redis-backend',
      'dist-minified',
      'main.js',
    )
    // Install VSCode and Chromedriver
    await exTester.downloadCode()
    await exTester.downloadChromeDriver()

    console.log(`${storageFolder} contents:`)
    const testResources = fs.readdirSync(storageFolder)
    testResources.forEach(item => {
      const fullPath = path.join(storageFolder, item)
      const stats = fs.statSync(fullPath)
      const type = stats.isDirectory() ? '(directory)' : '(file)'
      console.log(`${type} ${item}`)
    })

    if (!isLocalRun) {
      // Fix ChromeDriver path for selenium
      const chromedriverSource = path.join(
        storageFolder,
        'chromedriver-linux64',
        'chromedriver',
      )
      const chromedriverTarget = path.join(storageFolder, 'chromedriver')

      if (fs.existsSync(chromedriverSource)) {
        fs.copyFileSync(chromedriverSource, chromedriverTarget)
        fs.chmodSync(chromedriverTarget, 0o755)
        console.log(
          `ChromeDriver moved to expected path: ${chromedriverTarget}`,
        )
      } else {
        console.error(`ChromeDriver binary not found at: ${chromedriverSource}`)
        process.exit(1)
      }
    }

    // Install vsix if not installed yet
    if (!fs.existsSync(extensionDir)) {
      await exTester.installVsix({
        vsixFile: path.join(
          __dirname,
          '..',
          '..',
          '..',
          'release',
          Config.extensionName,
        ),
        useYarn: true,
        installDependencies: true,
      })
    }

    let testFilesEnv: string | string[] = process.env.TEST_FILES!
    if (process.env.TEST_FILES) {
      testFilesEnv = process.env.TEST_FILES.split('\n')
        .map(file => file.trim())
        .map(file => {
          return path.join(__dirname, '..', file)
        })
      console.log('Full Paths:', testFilesEnv)
    } else {
      console.error('TEST_FILES environment variable is not defined.')
    }

    const runTestsConfig = {
      settings: 'settings.json',
      logLevel: logging.Level.INFO,
      offline: false,
      resources: [],
    }

    // Run tests
    // First run EULA tests as EULA is not shown again
    // after accepting it and it prevents other controls from being shown
    if (!process.env.SKIP_EULA_TESTS) {
      await exTester.runTests(
        path.join(__dirname, '..', 'dist', 'tests', 'eula.e2e.js'),
        runTestsConfig,
      )
    }

    // Run tests
    if (!process.env.ONLY_EULA_TESTS) {
      await exTester.runTests(
        testFilesEnv ||
          path.join(__dirname, '..', 'dist', 'tests', '**', '*.e2e.js'),
        runTestsConfig,
      )
    }

    // Terminate extension node process
    VScodeScripts.terminateSpecificNodeProcesses(extensionProcessPath)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()

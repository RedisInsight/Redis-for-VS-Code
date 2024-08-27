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

    const exTester = new ExTester(
      DEFAULT_STORAGE_FOLDER,
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
      'redis.redis-for-vscode-0.0.1',
      'dist',
      'redis-backend',
      'dist-minified',
      'main.js',
    )
    // Install VSCode and Chromedriver
    await exTester.downloadCode()
    await exTester.downloadChromeDriver()
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

    let testFilesEnv = process.env.TEST_FILES
    if (testFilesEnv) {
      testFilesEnv.split('\n').map(file => {
        testFilesEnv = path.join(__dirname, '..', 'dist', file)
      })
      console.log('Full Paths:', testFilesEnv)
    } else {
      console.error('TEST_FILES environment variable is not defined.')
    }

    // Run tests
    await exTester.runTests(
      testFilesEnv || path.join(__dirname, '..', 'dist', 'tests', '**', '*.js'),
      {
        settings: 'settings.json',
        logLevel: logging.Level.INFO,
        offline: false,
        resources: [],
      },
    )
    // Terminate extension node process
    VScodeScripts.terminateSpecificNodeProcesses(extensionProcessPath)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()

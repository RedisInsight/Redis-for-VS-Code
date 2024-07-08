import {
  DEFAULT_STORAGE_FOLDER,
  ExTester,
  ReleaseQuality,
} from 'vscode-extension-tester'
import { logging } from 'selenium-webdriver'
import * as fs from 'fs'
import path = require('path')
import { Config } from './helpers/Conf'

// Delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
      `redis ltd..${Config.extensionName.replace('.vsix', '')}`,
    )
    // Install VSCode and Chromedriver
    await exTester.downloadCode()
    await exTester.downloadChromeDriver()
    // Install vsix if not installed yet
    if (!fs.existsSync(extensionDir)) {
      await exTester.installVsix({
        vsixFile: path.join(__dirname, '..', '..', '..', Config.extensionName),
        useYarn: true,
        installDependencies: true,
      })
    }

    // Wait for 10 seconds
    await delay(10000)

    // Run tests
    await exTester.runTests(
      [
        path.join(__dirname, '..', 'dist', 'tests', 'setup.js'),
        path.join(__dirname, '..', 'dist', 'tests', '**', '*.js'),
      ],
      {
        settings: 'settings.json',
        logLevel: logging.Level.INFO,
        offline: false,
        resources: [],
      },
    )
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()

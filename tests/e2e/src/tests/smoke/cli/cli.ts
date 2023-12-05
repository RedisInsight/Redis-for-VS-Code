import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'

import { BottomBarPanel, VSBrowser, WebDriver } from 'vscode-extension-tester'
import { BottomBar } from '../../../page-objects/components/bottom-bar/BottomBar'
import { WebView } from '../../../page-objects/components/WebView'
import { CliView } from '../../../page-objects/components/bottom-bar/CliView'
import { Common } from '../../../helpers/Common'

describe('CLI', () => {
  let browser: VSBrowser
  let driver: WebDriver
  let webView: WebView
  let bottomBar: BottomBar
  let cliView: CliView
  let panel: BottomBarPanel
  let keyName = Common.generateWord(20)

  beforeEach(async () => {
    browser = VSBrowser.instance
    driver = browser.driver
    bottomBar = new BottomBar()
    webView = new WebView()
    panel = new BottomBarPanel()

    await browser.waitForWorkbench(20_000)
    cliView = await bottomBar.openCliView()
    await webView.switchToFrame(WebView.webViewFrame)
  })
  afterEach(async () => {
    await webView.switchBack()
    await panel.openTerminalView()
  })
  it('Verify that user can send command via CLI', async function () {
    keyName = Common.generateWord(10)
    await cliView.executeCommand('info')
    const text = await cliView.getCliLastCommandResponse()
    expect(text).contain('redis_version:6.2.6')
  })
  // Update once treeView class added
  it.skip('Verify that user can add data via CLI', async function () {
    await cliView.executeCommand(
      `SADD ${keyName} "chinese" "japanese" "german"`,
    )
    // Search key and find created key in Tree view
  })
  it('Verify that user can use blocking command', async function () {
    await cliView.executeCommand('blpop newKey 10000')
    await driver.sleep(2000)
    const text = await cliView.getCliText()
    expect(text).contain('Executing command...')
  })
})

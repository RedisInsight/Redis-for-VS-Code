import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'

import { BottomBarPanel, VSBrowser, WebDriver } from 'vscode-extension-tester'
import { BottomBar } from '../../../page-objects/bottom-bar/BottomBar'
import { WebView } from '../../../page-objects/WebView'
import { CliView } from '../../../page-objects/bottom-bar/CliView'

describe('CLI', () => {
  let browser: VSBrowser
  let driver: WebDriver
  let webView: WebView
  let bottomBar: BottomBar
  let cliView: CliView
  let panel: BottomBarPanel

  beforeEach(async () => {
    browser = VSBrowser.instance
    driver = browser.driver
    bottomBar = new BottomBar()
    webView = new WebView()
    panel = new BottomBarPanel()

    await browser.waitForWorkbench(20_000)
    cliView = await bottomBar.openCliView()
    await webView.switchToFrame()
  })
  afterEach(async () => {
    await webView.switchBack()
    await panel.openTerminalView()
  })
  it('Verify that user can send command via CLI', async function () {
    await cliView.executeCommand('info')
    const text = await cliView.getCliResponse()
    expect(text).contain('redis_version:6.2.6')
  })
})

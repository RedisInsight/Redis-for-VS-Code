import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import { BottomBar } from '../../../page-objects/components/bottom-bar/BottomBar'
import { WebView } from '../../../page-objects/components/WebView'
import { CliViewPanel } from '../../../page-objects/components/bottom-bar/CliViewPanel'
import { Common } from '../../../helpers/Common'
import { CommonDriverExtension } from '../../../helpers/CommonDriverExtension'

describe('CLI', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyName = Common.generateWord(20)

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()

    await browser.waitForWorkbench(20_000)
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(CliViewPanel.cliFrame)
  })
  afterEach(async () => {
    await webView.switchBack()
    await bottomBar.openTerminalView()
  })
  it('Verify that user can send command via CLI', async function () {
    keyName = Common.generateWord(10)
    await cliViewPanel.executeCommand('info')
    const text = await cliViewPanel.getCliLastCommandResponse()
    expect(text).contain('redis_version:')
  })
  // Update once treeView class added
  it.skip('Verify that user can add data via CLI', async function () {
    await cliViewPanel.executeCommand(
      `SADD ${keyName} "chinese" "japanese" "german"`,
    )
    // Search key and find created key in Tree view
  })
  it('Verify that user can use blocking command', async function () {
    await cliViewPanel.executeCommand('blpop newKey 10000')
    await CommonDriverExtension.driverSleep(2000)
    const text = await cliViewPanel.getCliText()
    expect(text).contain('Executing command...')
  })
})

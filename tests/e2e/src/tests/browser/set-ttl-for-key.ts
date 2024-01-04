import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  CliViewPanel,
  KeyDetailsView,
  KeyTreeView,
  WebView,
} from '@e2eSrc/page-objects/components'

import { InputActions, ButtonsActions } from '@e2eSrc/helpers/common-actions'
import { Common } from '@e2eSrc/helpers/Common'
import { Views } from '@e2eSrc/page-objects/components/WebView'

describe('Set TTL for Key', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: KeyDetailsView
  let keyTreeView: KeyTreeView
  let sideBarView: SideBarView | undefined

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await bottomBar.openTerminalView()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    await cliViewPanel.executeCommand(`FLUSHDB`)
  })
  it.skip('Verify that user can specify TTL for Key', async function () {
    const ttlValue = '2147476121'

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    const keyName = Common.generateWord(20)
    const command = `SET ${keyName} a`
    await cliViewPanel.executeCommand(`${command}`)
    await webView.switchBack()

    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(Views.KeyTreeView)
    await keyTreeView.openKeyDetailsByKeyName(keyName)
    await webView.switchBack()

    await webView.switchToFrame(Views.KeyDetailsView)
    const inputField = await keyDetailsView.getElement(keyDetailsView.ttlField)
    await InputActions.slowType(inputField, ttlValue)
    await ButtonsActions.clickElement(keyDetailsView.saveTtl)

    await ButtonsActions.clickElement(keyDetailsView.keyRefresh)

    const newTtlValue = Number(await keyDetailsView.getKeyTtl())
    expect(Number(ttlValue)).gt(newTtlValue)
  })
})

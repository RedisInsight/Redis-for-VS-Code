import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  BottomBar,
  CliViewPanel,
  KeyDetailsView,
  TreeView,
  WebView,
} from '@e2eSrc/page-objects/components'

import {
  InputActions,
  ButtonActions,
  KeyDetailsActions,
  DatabasesActions,
} from '@e2eSrc/helpers/common-actions'
import { Common } from '@e2eSrc/helpers/Common'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'

describe('Set TTL for Key', () => {
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView

  beforeEach(async () => {
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    await bottomBar.openTerminalView()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    await cliViewPanel.executeCommand(`FLUSHDB`)
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can specify TTL for Key', async function () {
    const ttlValue = '2147476121'

    await webView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    const keyName = Common.generateWord(20)
    const command = `SET ${keyName} a`
    await cliViewPanel.executeCommand(`${command}`)
    await webView.switchBack()
    // Refresh database
    await webView.switchToFrame(Views.TreeView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const inputField = await keyDetailsView.getElement(keyDetailsView.ttlField)
    await InputActions.slowType(inputField, ttlValue)
    await ButtonActions.clickElement(keyDetailsView.saveTtl)

    await ButtonActions.clickElement(keyDetailsView.refreshKeyButton)

    const newTtlValue = Number(await keyDetailsView.getKeyTtl())
    expect(Number(ttlValue)).gt(newTtlValue)
  })
})

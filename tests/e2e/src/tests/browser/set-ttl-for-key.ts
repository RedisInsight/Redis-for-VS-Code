import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import {
  BottomBar,
  CliViewPanel,
  InputWithButtons,
  KeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import {
  InputActions,
  ButtonActions,
  KeyDetailsActions,
  DatabasesActions,
} from '@e2eSrc/helpers/common-actions'
import { Common } from '@e2eSrc/helpers/Common'
import { Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

describe('Set TTL for Key', () => {
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView

  before(async () => {
    bottomBar = new BottomBar()
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  afterEach(async () => {
    await keyDetailsView.switchBack()
    await bottomBar.openTerminalView()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await keyDetailsView.switchToInnerViewFrame(InnerViews.CliInnerView)
    await cliViewPanel.executeCommand(`FLUSHDB`)
  })
  it('Verify that user can specify TTL for Key', async function () {
    const ttlValue = '2147476121'

    await keyDetailsView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await keyDetailsView.switchToInnerViewFrame(InnerViews.CliInnerView)
    const keyName = Common.generateWord(20)
    const command = `SET ${keyName} a`
    await cliViewPanel.executeCommand(`${command}`)
    await keyDetailsView.switchBack()
    // Refresh database
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
    await InputActions.slowType(keyDetailsView.inlineItemEditor, ttlValue)
    await ButtonActions.clickElement(InputWithButtons.applyInput)

    await ButtonActions.clickElement(keyDetailsView.refreshKeyButton)

    const newTtlValue = Number(
      await InputActions.getInputValue(keyDetailsView.inlineItemEditor),
    )
    expect(Number(ttlValue)).gt(newTtlValue)
  })
})

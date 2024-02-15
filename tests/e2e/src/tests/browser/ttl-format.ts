import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  CliViewPanel,
  KeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { COMMANDS_TO_CREATE_KEY, keyLength } from '@e2eSrc/helpers/constants'
import { keyTypes } from '@e2eSrc/helpers/KeysActions'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import {
  DatabasesActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'

const keysData = keyTypes.map(object => ({ ...object })).slice(0, 6)
for (const key of keysData) {
  key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`
}
// Arrays with TTL in seconds, min, hours, days, months, years and their values in Browser Page
const ttlForSet = [59, 800, 20000, 2000000, 31000000, 2147483647]
const ttlValues = ['s', '13 min', '5 h', '23 d', '11 mo', '68 yr']

describe('TTL values in Keys Table', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
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
  it('Verify that Key is deleted if TTL finishes', async function () {
    // Create new key with TTL
    const TTL = 15
    const keyName = Common.generateWord(10)

    await webView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    await cliViewPanel.executeCommand(`set ${keyName} EXPIRE ${TTL}`)
    await webView.switchBack()
    await webView.switchToFrame(Views.TreeView)
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )

    // Verify that the key is really added
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).ok(
      'Key not added',
    )

    // Check that key with finished TTL is deleted
    await CommonDriverExtension.driverSleep(TTL)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).not.ok(
      'Key is still displayed',
    )
  })

  it('Verify that user can see TTL in the list of keys rounded down to the nearest unit', async function () {
    await webView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)

    for (let i = 0; i < keysData.length; i++) {
      await cliViewPanel.executeCommand(
        `${COMMANDS_TO_CREATE_KEY[keysData[i].textType](
          keysData[i].keyName,
        )} EXPIRE ${ttlForSet[i]}`,
      )
    }
    await webView.switchBack()
    // Refresh database
    await webView.switchToFrame(Views.TreeView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )

    // Check that Keys has correct TTL value in keys table
    for (let i = 0; i < keysData.length; i++) {
      // Open key details iframe
      await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
        keysData[i].keyName,
      )
      expect(await keyDetailsView.getKeyTtl()).contains(
        ttlValues[i],
        `TTL value in keys table is not ${ttlValues[i]}`,
      )
    }
  })
})

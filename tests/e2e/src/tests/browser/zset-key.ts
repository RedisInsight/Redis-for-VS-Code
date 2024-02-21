import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  SortedSetKeyDetailsView,
  TreeView,
  CliViewPanel,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonActions,
  DatabasesActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SortedSetKeyParameters } from '@e2eSrc/helpers/types/types'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

let keyName: string

describe('ZSet Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let keyDetailsView: SortedSetKeyDetailsView
  let treeView: TreeView
  let cliViewPanel: CliViewPanel

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new SortedSetKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can search and delete by member in Zset', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'sortedSetField'
    const score = 1
    const zsetKeyParameters: SortedSetKeyParameters = {
      keyName: keyName,
      members: [
        {
          name: 'zsetField11111',
          score: 0,
        },
      ],
    }

    await KeyAPIRequests.addSortedSetKeyApi(
      zsetKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
    // Verify that user can add members to Zset
    await keyDetailsView.addMemberToZSet(keyFieldValue, score)
    // Search the added member
    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.sortedSetFieldsList)
    )[0].getText()
    let value = await (
      await keyDetailsView.getElements(keyDetailsView.scoreSortedSetFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    expect(value).eqls(`${score}`)
    await keyDetailsView.clearSearchInKeyDetails()

    // Verify that user can remove member from ZSet
    await keyDetailsView.removeRowByField(KeyTypesShort.ZSet, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.ZSet,
      keyFieldValue,
    )
    await webView.switchBack()
    // Check the notification message that field deleted
    await NotificationActions.checkNotificationMessage(
      `${keyFieldValue} has been removed from ${keyName}`,
    )

    await webView.switchToFrame(Views.KeyDetailsView)
    await keyDetailsView.removeFirstRow(KeyTypesShort.ZSet)
    await webView.switchBack()

    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for zset key after deletion
    KeyDetailsActions.verifyDetailsPanelClosed()
  })

  it('Verify that user can sort Zset members by score by DESC and ASC', async function () {
    keyName = Common.generateWord(10)
    const arr = await Common.createArray(100)
    let command = `ZADD ${keyName} ${arr.join(' ')}`

    await webView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    await cliViewPanel.executeCommand(command)

    await webView.switchBack()
    // should be removed when iframe get unic locator
    await bottomBar.toggle(false)

    // Refresh database
    await webView.switchToFrame(Views.TreeView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await ButtonActions.clickElement(keyDetailsView.scoreButton)
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.scoreSortedSetFieldsList)
    )[0].getText()

    expect(result).eql(arr[100 - 1], 'The Zset sort by desc')

    await ButtonActions.clickElement(keyDetailsView.scoreButton)
    result = await (
      await keyDetailsView.getElements(keyDetailsView.scoreSortedSetFieldsList)
    )[0].getText()
    expect(result).eql(arr[1], 'The Zset sort by desc')
  })
})

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach, BottomBarPanel } from 'vscode-extension-tester'
import {
  BottomBar,
  SortedSetKeyDetailsView,
  TreeView,
  AddSortedSetKeyView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonActions,
  DatabasesActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import {
  CliAPIRequests,
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SortedSetKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('ZSet Key fields verification', () => {
  let bottomBar: BottomBar
  let bottomBarPanel: BottomBarPanel
  let keyDetailsView: SortedSetKeyDetailsView
  let treeView: TreeView
  let addSortedSetKeyView: AddSortedSetKeyView

  before(async () => {
    bottomBar = new BottomBar()
    bottomBarPanel = new BottomBarPanel()
    keyDetailsView = new SortedSetKeyDetailsView()
    treeView = new TreeView()
    addSortedSetKeyView = new AddSortedSetKeyView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
    await NotificationActions.closeAllNotifications()
  })
  afterEach(async () => {
    await keyDetailsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
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

    // Verify that user can add ZSet Key
    await addSortedSetKeyView.addKey(zsetKeyParameters, KeyTypesShort.ZSet)
    await keyDetailsView.switchBack()
    // Check the notification message that key added
    await NotificationActions.checkNotificationMessage(`Key has been added`)

    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)

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
    expect(value.length).eqls(1)
    expect(value).eqls(`${score}`)
    await keyDetailsView.clearSearchInKeyDetails()

    // Verify that user can remove member from ZSet
    await keyDetailsView.removeRowByField(KeyTypesShort.ZSet, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.ZSet,
      keyFieldValue,
    )
    await keyDetailsView.switchBack()
    // Check the notification message that field deleted
    await NotificationActions.checkNotificationMessage(
      `${keyFieldValue} has been removed from ${keyName}`,
    )

    await keyDetailsView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
    await keyDetailsView.removeFirstRow(KeyTypesShort.ZSet)
    await keyDetailsView.switchBack()

    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for zset key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })

  it('Verify that user can sort Zset members by score by DESC and ASC', async function () {
    keyName = Common.generateWord(10)
    const arr = await Common.createArray(100)
    let command = `ZADD ${keyName} ${arr.join(' ')}`

    await CliAPIRequests.sendRedisCliCommandApi(
      command,
      Config.ossStandaloneConfig,
    )
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

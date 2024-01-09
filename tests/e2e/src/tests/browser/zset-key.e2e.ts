import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  ActivityBar,
  VSBrowser,
  Workbench,
} from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  SortedSetKeyDetailsView,
  KeyTreeView,
  CliViewPanel,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { ButtonsActions, KeyDetailsActions } from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SortedSetKeyParameters } from '@e2eSrc/helpers/types/types'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { KeyActions } from '@e2eSrc/helpers/KeysActions'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

let keyName: string
const deleteMessage = 'Key has been deleted'

describe('ZSet Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let keyDetailsView: SortedSetKeyDetailsView
  let keyTreeView: KeyTreeView
  let cliViewPanel: CliViewPanel

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new SortedSetKeyDetailsView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can search by member in Zset', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'hashField11111'
    const keyValue = 0
    const zsetKeyParameters: SortedSetKeyParameters = {
      keyName: keyName,
      members: [
        {
          name: keyFieldValue,
          score: keyValue,
        },
      ],
    }
    const keyToAddParameters = {
      fieldsCount: 1,
      keyName,
      fieldStartWith: 'sortedSetField',
    }

    await KeyAPIRequests.addSortedSetKeyApi(
      zsetKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Add fields to the hash key
    await KeyActions.populateZSetWithMembers(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters,
    )

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.sortedSetFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)

    await keyDetailsView.removeRowByField(KeyTypesShort.ZSet, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.ZSet,
      keyFieldValue,
    )
    await webView.switchBack()

    const notifications = await new Workbench().getNotifications()
    const notification = notifications[0]
    // get the message
    const message = await notification.getMessage()
    expect(message).eqls(deleteMessage)
  })

  it('Verify that user can sort Zset members by score by DESC and ASC', async function () {
    keyName = Common.generateWord(10)
    const arr = await Common.createArray(100)
    let command = `ZADD ${keyName} ${arr.join(' ')}`

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    await cliViewPanel.executeCommand(command)

    await webView.switchBack()
    // should be removed when iframe get unic locator
    await bottomBar.toggle(false)

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await ButtonsActions.clickElement(keyDetailsView.scoreButton)
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.scoreSortedSetFieldsList)
    )[0].getText()

    expect(result).eql(arr[100 - 1], 'The Zset sort by desc')

    await ButtonsActions.clickElement(keyDetailsView.scoreButton)
    result = await (
      await keyDetailsView.getElements(keyDetailsView.scoreSortedSetFieldsList)
    )[0].getText()
    expect(result).eql(arr[1], 'The Zset sort by desc')
  })
})

import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  ActivityBar,
  SideBarView,
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
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SortedSetKeyParameters } from '@e2eSrc/helpers/types/types'
import { ViewElements, Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string
const deleteMessage = 'Key has been deleted'

describe('ZSet Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let keyDetailsView: SortedSetKeyDetailsView
  let keyTreeView: KeyTreeView
  let sideBarView: SideBarView | undefined
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
    const hashKeyParameters: SortedSetKeyParameters = {
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
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Add 20000 fields to the hash key
    await KeyAPIRequests.populateZSetWithMembers(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters,
    )

    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(Views.KeyTreeView)
    await keyTreeView.openKeyDetailsByKeyName(keyName)
    await webView.switchBack()

    await webView.switchToFrame(Views.KeyDetailsView)

    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.sortedSetFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)

    await keyDetailsView.removeRowByField(keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(keyFieldValue)
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
    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(Views.KeyTreeView)
    await keyTreeView.openKeyDetailsByKeyName(keyName)
    await webView.switchBack()

    await webView.switchToFrame(Views.KeyDetailsView)
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

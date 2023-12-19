import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  HashKeyDetailsView,
  KeyTreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'

let KeyName: string

describe('Hash Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let keyDetailsView: HashKeyDetailsView
  let keyTreeView: KeyTreeView
  let sideBarView: SideBarView | undefined

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new HashKeyDetailsView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      KeyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can search by full field name in Hash', async function () {
    KeyName = Common.generateWord(10)
    const keyFieldValue = 'hashField11111'
    const keyValue = 'hashValue11111!'
    const hashKeyParameters: HashKeyParameters = {
      keyName: KeyName,
      fields: [
        {
          field: keyFieldValue,
          value: keyValue,
        },
      ],
    }
    await KeyAPIRequests.addHashKeyApi(
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(KeyTreeView.treeFrame)
    await keyTreeView.openKeyDetailsByKeyName(KeyName)
    await webView.switchBack()

    await webView.switchToFrame(HashKeyDetailsView.keyFrame)
    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)

    await keyDetailsView.searchByTheValueInKeyDetails('hashField*')
    // Check the search result
    result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).eqls(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)

    await keyDetailsView.searchByTheValueInKeyDetails('*11111')
    // Check the search result
    result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).eqls(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)

    await keyDetailsView.searchByTheValueInKeyDetails('hash*11111')
    // Check the search result
    result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).eqls(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)
  })
})

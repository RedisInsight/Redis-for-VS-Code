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
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

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
  it('Verify that user can search per exact field name in Hash in DB with 1 million of fields', async function () {
    KeyName = Common.generateWord(10)
    const keyFieldValue = 'field'
    const keyValue = 'value!'
    const hashKeyParameters: HashKeyParameters = {
      keyName: KeyName,
      fields: [
        {
          field: keyFieldValue,
          value: keyValue,
        },
      ],
    }
    const keyToAddParameters = {
      fieldsCount: 20000,
      KeyName,
      fieldStartWith: 'hashField',
      fieldValueStartWith: 'hashValue',
    }

    const keyToAddParameters2 = {
      fieldsCount: 1,
      KeyName,
      fieldStartWith: 'hastToSearch',
      fieldValueStartWith: 'hashValue',
    }

    await KeyAPIRequests.addHashKeyApi(
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )

    // Add 20000 fields to the hash key
    await KeyAPIRequests.populateHashWithFields(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters,
    )

    // Add 1 fields to the hash key
    await KeyAPIRequests.populateHashWithFields(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters2,
    )

    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(KeyTreeView.treeFrame)
    await keyTreeView.openKeyDetailsByKeyName(KeyName)
    await webView.switchBack()

    await webView.switchToFrame(HashKeyDetailsView.keyFrame)
    await keyDetailsView.searchByTheValueInKeyDetails(
      keyToAddParameters2.fieldStartWith + '*',
    )
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).contains(keyToAddParameters2.fieldStartWith)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)
  })
})

import { By } from 'selenium-webdriver'
import { expect } from 'chai'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Common } from '@e2eSrc/helpers/Common'
import { Config } from '@e2eSrc/helpers/Conf'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import {
  WebView,
  StringKeyDetailsView,
  KeyTreeView,
} from '@e2eSrc/page-objects/components'
import { KeyDetailsActions } from '@e2eSrc/helpers/common-actions'

describe('Actions with Key List', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: StringKeyDetailsView
  let keyTreeView: KeyTreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new StringKeyDetailsView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
  })

  it('Verify that key deleted properly', async function () {
    // Adding a string key
    const keyName = Common.generateWord(10)
    const keyValue = Common.generateWord(10)
    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: keyName,
        value: keyValue,
      },
      Config.ossStandaloneConfig.databaseName,
    )

    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)

    let actualItemsArray = await keyTreeView.getAllKeysArray()
    expect(actualItemsArray).contains(keyName, 'Key added properly')

    await keyTreeView.deleteKeyFromListByName(keyName)
    expect(actualItemsArray.includes(keyName)).eql(false, 'Key deleted from the list properly')
  })

  it('Verify that key deleted properly from details', async function () {
    const keyName = Common.generateWord(10)
    const keyValue = Common.generateWord(10)
    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: keyName,
        value: keyValue,
      },
      Config.ossStandaloneConfig.databaseName,
    )

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    // Delete key from detailed view 
    keyDetailsView.removeKeyFromDetailedView()
    expect(!keyDetailsView?.keyStringValue).eql(true, 'Detailed view closed after deleting')
  })
})
import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import { WebView, KeyTreeView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyAPIRequests, CliAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'

describe('Filtering iteratively in Tree view', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyTreeView: KeyTreeView
  let keys: string[]

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    for (const keyName of keys) {
      await KeyAPIRequests.deleteKeyIfExistsApi(
        keyName,
        Config.ossStandaloneConfig.databaseName,
      )
    }
  })
  it.skip('Verify that user can search iteratively via Scan more for search pattern and selected data type', async function () {
    // Create new keys
    keys = await Common.createArrayWithKeyValue(1000)
    await CliAPIRequests.sendRedisCliCommandApi(
      `MSET ${keys.join(' ')}`,
      Config.ossStandaloneConfig,
    )

    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)
    // Search all string keys - add tests after search and filter will be implemented

    // Verify that scan more button is shown
    expect(await keyTreeView.isElementDisplayed(keyTreeView.scanMoreBtn)).eql(
      true,
      'Scan more is not shown',
    )
    await ButtonsActions.clickElement(keyTreeView.scanMoreBtn)
    // Verify that number of results is 1000 - add tests when total number of keys is implemented
  })
  // Run this test only for big database instance 8103
  it.skip('Verify that user use Scan More in DB with 10-50 millions of keys (when search by pattern/)', async function () {
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)
    // Search all string keys - add tests after search and filter will be implemented

    // Verify that scan more button is shown
    expect(await keyTreeView.isElementDisplayed(keyTreeView.scanMoreBtn)).eql(
      true,
      'Scan more is not shown',
    )
    await ButtonsActions.clickElement(keyTreeView.scanMoreBtn)
    const regExp = new RegExp('1 0' + '.')
    // Verify that number of results is 1000 - add tests when total number of keys is implemented
  })
})

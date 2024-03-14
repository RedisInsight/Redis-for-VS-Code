import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { WebView, TreeView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  KeyAPIRequests,
  CliAPIRequests,
  DatabaseAPIRequests,
} from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ButtonActions, DatabasesActions } from '@e2eSrc/helpers/common-actions'

describe('Filtering iteratively in Tree view', () => {
  let webView: WebView
  let treeView: TreeView
  let keys: string[]

  before(async () => {
    webView = new WebView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
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
  it('Verify that user can search iteratively via Scan more for search pattern and selected data type', async function () {
    // Create new keys
    keys = await Common.createArrayWithKeyValue(1000)
    await CliAPIRequests.sendRedisCliCommandApi(
      `MSET ${keys.join(' ')}`,
      Config.ossStandaloneConfig,
    )
    // TODO Search all string keys - add tests after search and filter will be implemented

    // Verify that scan more button is shown
    expect(await treeView.isElementDisplayed(treeView.scanMoreBtn)).eql(
      true,
      'Scan more is not shown',
    )
    await ButtonActions.clickElement(treeView.scanMoreBtn)
    // TODO Verify that number of results is 1000 - add tests when total number of keys is implemented
  })
})

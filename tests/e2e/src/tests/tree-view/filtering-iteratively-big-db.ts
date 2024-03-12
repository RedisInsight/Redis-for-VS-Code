import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { WebView, TreeView } from '@e2eSrc/page-objects/components'
import { KeyAPIRequests, DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ButtonActions, DatabasesActions } from '@e2eSrc/helpers/common-actions'

describe('Filtering iteratively in Tree view for Big database', () => {
  let webView: WebView
  let treeView: TreeView
  let keys: string[]

  beforeEach(async () => {
    webView = new WebView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    for (const keyName of keys) {
      await KeyAPIRequests.deleteKeyIfExistsApi(
        keyName,
        Config.ossStandaloneBigConfig.databaseName,
      )
    }
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user use Scan More in DB with 10-50 millions of keys (when search by pattern/)', async function () {
    // TODO Search all string keys - add tests after search and filter will be implemented

    // Verify that scan more button is shown
    expect(await treeView.isElementDisplayed(treeView.scanMoreBtn)).eql(
      true,
      'Scan more is not shown',
    )
    await ButtonActions.clickElement(treeView.scanMoreBtn)
    const regExp = new RegExp('1 0' + '.')
    // TODO Verify that number of results is 1000 - add tests when total number of keys is implemented
  })
})

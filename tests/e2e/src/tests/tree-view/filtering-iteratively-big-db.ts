import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import { TreeView } from '@e2eSrc/page-objects/components'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ButtonActions, DatabasesActions } from '@e2eSrc/helpers/common-actions'

describe('Filtering iteratively in Tree view for Big database', () => {
  let treeView: TreeView

  beforeEach(async () => {
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  afterEach(async () => {
    await treeView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user use Scan More in DB with 10-50 millions of keys (when search by pattern/)', async function () {
    // Search all keys
    await treeView.searchByKeyName('*')
    // Verify that scan more button is shown
    expect(await treeView.isElementDisplayed(treeView.scanMoreBtn)).eql(
      true,
      'Scan more is not shown',
    )
    await ButtonActions.clickElement(treeView.scanMoreBtn)
    const regExp = new RegExp(`2000[0-9]`)
    // Verify that number of results is 20000
    const scannedValueText = await treeView.getScannedResults()
    expect(scannedValueText).match(regExp, 'Number of results is not 20000 after scanning more')
  })
})

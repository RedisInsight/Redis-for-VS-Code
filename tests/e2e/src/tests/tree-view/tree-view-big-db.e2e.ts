import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import { TreeView } from '@e2eSrc/page-objects/components'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ButtonActions, DatabasesActions } from '@e2eSrc/helpers/common-actions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

describe('Tree view verifications for big database', () => {
  let treeView: TreeView

  before(async () => {
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  afterEach(async () => {
    await treeView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  after(async () => {
    await treeView.switchBack()

    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  it('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view', async function () {
    // Verify the controls on the Tree view
    expect(await treeView.waitForElementVisibility(treeView.scanMoreBtn)).eql(
      true,
      'Tree view Scan more button not displayed for big database',
    )
    expect(await treeView.getElementText(treeView.scanMoreBtn)).contains(
      'Scanned',
      'Scanned key is not correct',
    )
    expect(await treeView.waitForElementVisibility(treeView.totalKeyNumber)).eql(
      true,
      'incorrect count is displayed',
    )
    const count = await treeView.getScannedResults()
    await ButtonActions.clickAndWaitForElement(treeView.scanMoreBtn, treeView.loadingIndicator, true, 1000)

    expect(await treeView.getScannedResults()).gt(
      count,
      'the keys were not scanned',
    )
  })

  it('Verify that when user deletes the key he can see the key is removed from the folder', async function () {
    const mainFolder = treeView.getFolderSelectorByName('device')
    await treeView.getElement(mainFolder)
    expect(await treeView.isElementDisplayed(mainFolder)).eql(
      true,
      'The key folder is not displayed',
    )
    await ButtonActions.clickAndWaitForElement(mainFolder, treeView.getFolderNameSelectorByNameAndIndex('device', 2), true, 1000)
    const targetFolderName = await treeView.getElementText(
      treeView.getFolderNameSelectorByNameAndIndex('device', 2),
    )
    const targetFolderSelector = treeView.getFolderSelectorByName(
      `device:${targetFolderName}`,
    )
    await ButtonActions.clickAndWaitForElement(targetFolderSelector, treeView.keyInFolder, true, 1000)
    await treeView.deleteFirstKeyFromList()
    // Verify the results
    expect(await treeView.isElementDisplayed(targetFolderSelector)).eql(
      false,
      'The previous folder is not closed after removing key folder',
    )
    expect(await treeView.verifyElementExpanded(mainFolder)).eql(
      true,
      'The main folder is not expanded',
    )
  })
})

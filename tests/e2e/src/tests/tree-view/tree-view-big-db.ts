import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import { TreeView } from '@e2eSrc/page-objects/components'
import { KeyAPIRequests, DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ButtonActions, DatabasesActions } from '@e2eSrc/helpers/common-actions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

describe('Tree view verifications', () => {
  let treeView: TreeView
  let keyNames: string[] = []

  before(async () => {
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  after(async () => {
    await treeView.switchBack()

    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await treeView.switchBack()
    for (const keyName of keyNames) {
      await KeyAPIRequests.deleteKeyIfExistsApi(
        keyName,
        Config.ossStandaloneBigConfig.databaseName,
      )
    }
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })

  it('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view', async function () {
    const number = 10500

    // Verify the controls on the Tree view
    expect(await treeView.isElementDisplayed(treeView.scanMoreBtn)).eql(
      true,
      'Tree view Scan more button not displayed for big database',
    )
    expect(await treeView.isElementDisplayed(treeView.keyScannedNumber)).eql(
      true,
      'Scanned key is not correct',
    )
    expect(await treeView.isElementDisplayed(treeView.totalKeyNumber)).eql(
      true,
      'incorrect count is displayed',
    )
    const count = parseInt(await treeView.getElementText(treeView.scanMoreBtn))
     await ButtonActions.clickElement(treeView.scanMoreBtn)

    expect(parseInt (await treeView.getElementText(treeView.scanMoreBtn))).gt(
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
    await ButtonActions.clickElement(mainFolder)
    const targetFolderName = await treeView.getElementText(
      treeView.getFolderNameSelectorByNameAndIndex('device', 2),
    )
    const targetFolderSelector = treeView.getFolderSelectorByName(
      `device:${targetFolderName}`,
    )
    await ButtonActions.clickElement(targetFolderSelector)
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

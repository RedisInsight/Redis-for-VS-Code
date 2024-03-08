import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import { WebView, TreeView } from '@e2eSrc/page-objects/components'
import { KeyAPIRequests, DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ButtonActions, DatabasesActions } from '@e2eSrc/helpers/common-actions'

describe('Tree view verifications', () => {
  let browser: VSBrowser
  let webView: WebView
  let treeView: TreeView
  let keyNames: string[] = []

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    for (const keyName of keyNames) {
      await KeyAPIRequests.deleteKeyIfExistsApi(
        keyName,
        Config.ossStandaloneBigConfig.databaseName,
      )
    }
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  // TODO unskip once filtering by key type implemented
  it.skip('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view', async function () {
    // TODO Select filter by key type
    // Verify the controls on the Tree view
    expect(await treeView.isElementDisplayed(treeView.scanMoreBtn)).eql(
      true,
      'Tree view Scan more button not displayed for big database',
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

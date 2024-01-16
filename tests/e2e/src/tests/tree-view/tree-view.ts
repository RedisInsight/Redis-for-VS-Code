import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import { WebView, KeyTreeView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyAPIRequests, CliAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'

describe('Tree view verifications', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyTreeView: KeyTreeView
  let keyNames: string[] = []

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
    await CliAPIRequests.sendRedisCliCommandApi(
      'flushdb',
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    for (const keyName of keyNames) {
      await KeyAPIRequests.deleteKeyIfExistsApi(
        keyName,
        Config.ossStandaloneConfig.databaseName,
      )
    }
  })
  it.skip('Verify that if there are keys without namespaces, they are displayed in the root directory after all folders by default in the Tree view', async function () {
    keyNames = [
      `atest:a-${Common.generateWord(10)}`,
      `atest:z-${Common.generateWord(10)}`,
      `ztest:a-${Common.generateWord(10)}`,
      `ztest:z-${Common.generateWord(10)}`,
      `atest-${Common.generateWord(10)}`,
      `ztest-${Common.generateWord(10)}`,
    ]
    const stringKeys = [keyNames[0], keyNames[1], keyNames[2], keyNames[5]]
    const setKeys = [keyNames[3], keyNames[4]]
    const expectedSortedByASC = [
      keyNames[0].split(':')[1],
      keyNames[1].split(':')[1],
      keyNames[2].split(':')[1],
      keyNames[3].split(':')[1],
      keyNames[4],
      keyNames[5],
    ]
    const expectedSortedByDESC = [
      keyNames[3].split(':')[1],
      keyNames[2].split(':')[1],
      keyNames[1].split(':')[1],
      keyNames[0].split(':')[1],
      keyNames[5],
      keyNames[4],
    ]

    // Create 5 keys
    for (const key of stringKeys) {
      await KeyAPIRequests.addStringKeyApi(
        { keyName: key, value: 'value' },
        Config.ossStandaloneConfig.databaseName,
      )
    }
    for (const key of setKeys) {
      await KeyAPIRequests.addSetKeyApi(
        { keyName: key, members: ['value'] },
        Config.ossStandaloneConfig.databaseName,
      )
    }
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)

    // Verify that if there are keys without namespaces, they are displayed in the root directory after all folders by default in the Tree view
    await keyTreeView.openTreeFolders([`${keyNames[0]}`.split(':')[0]])
    await keyTreeView.openTreeFolders([`${keyNames[2]}`.split(':')[0]])
    let actualItemsArray = await keyTreeView.getAllKeysArray()
    // Verify that user can see all folders and keys sorted by name ASC by default
    expect(actualItemsArray).eql(expectedSortedByASC)

    // Verify that user can change the sorting ASC-DESC
    await ButtonsActions.clickElement(keyTreeView.sortKeysBtn)
    await keyTreeView.openTreeFolders([`${keyNames[2]}`.split(':')[0]])
    await keyTreeView.openTreeFolders([`${keyNames[0]}`.split(':')[0]])
    actualItemsArray = await keyTreeView.getAllKeysArray()
    expect(actualItemsArray).eql(expectedSortedByDESC)
  })
  // Run this test only for database instance without keys
  it.skip('Verify that user can see message "No keys to display." when there are no keys in the database', async function () {
    const message = 'Keys are the foundation of Redis.'

    expect(await keyTreeView.getElementText(keyTreeView.treeViewPage)).eql(
      message,
      'Tree view no keys message not shown',
    )
  })
  // Run this test only for big database instance 8103
  it.skip('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view and Browser view', async function () {
    // Verify the controls on the Browser view

    // Verify the controls on the Tree view
    expect(await keyTreeView.isElementDisplayed(keyTreeView.scanMoreBtn)).eql(
      true,
      'Tree view Scan more button not displayed for big database',
    )
  })
  // Run this test only for big database instance 8103
  it.skip('Verify that when user deletes the key he can see the key is removed from the folder', async t => {
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)

    const mainFolder = keyTreeView.getFolderSelectorByName('device')
    await keyTreeView.getElement(mainFolder)
    expect(await keyTreeView.isElementDisplayed(mainFolder)).eql(
      true,
      'The key folder is not displayed',
    )
    await ButtonsActions.clickElement(mainFolder)
    const targetFolderName = await keyTreeView.getElementText(
      keyTreeView.getFolderNameSelectorByNameAndIndex('device', 2),
    )
    const targetFolderSelector = keyTreeView.getFolderSelectorByName(
      `device:${targetFolderName}`,
    )
    await ButtonsActions.clickElement(targetFolderSelector)
    await keyTreeView.deleteFirstKeyFromList()
    // Verify the results
    expect(await keyTreeView.isElementDisplayed(targetFolderSelector)).eql(
      false,
      'The previous folder is not closed after removing key folder',
    )
    expect(await keyTreeView.verifyElementExpanded(mainFolder)).eql(
      true,
      'The main folder is not expanded',
    )
  })
})

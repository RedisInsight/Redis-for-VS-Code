import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import { WebView, TreeView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyAPIRequests, CliAPIRequests, DatabaseAPIRequests } from '@e2eSrc/helpers/api'
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
      Config.ossStandaloneConfig,
    )
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
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that if there are keys without namespaces, they are displayed in the root directory after all folders by default in the Tree view', async function () {
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
    // Refresh database
    await treeView.refreshDatabaseByName(Config.ossStandaloneConfig.databaseName)

    // Verify that if there are keys without namespaces, they are displayed in the root directory after all folders by default in the Tree view
    await treeView.openTreeFolders([`${keyNames[0]}`.split(':')[0]])
    await treeView.openTreeFolders([`${keyNames[2]}`.split(':')[0]])
    let actualItemsArray = await treeView.getAllKeysArray()
    // Verify that user can see all folders and keys sorted by name ASC by default
    expect(actualItemsArray).eql(expectedSortedByASC)

    // Verify that user can change the sorting ASC-DESC
    await ButtonActions.clickElement(treeView.sortKeysBtn)
    await treeView.openTreeFolders([`${keyNames[2]}`.split(':')[0]])
    await treeView.openTreeFolders([`${keyNames[0]}`.split(':')[0]])
    actualItemsArray = await treeView.getAllKeysArray()
    expect(actualItemsArray).eql(expectedSortedByDESC)
  })
  it('Verify that user can see message "No keys to display." when there are no keys in the database', async function () {
    const message = 'Keys are the foundation of Redis.'

    expect(await treeView.getElementText(treeView.treeViewPage)).eql(
      message,
      'Tree view no keys message not shown',
    )
  })
  // TODO Add checks once Edit the key name in details and search functionality is ready
  it.skip('Verify that user can refresh Keys', async function () {

  })
})

import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import { WebView, KeyTreeView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyAPIRequests, CliAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'

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
    // const expectedSortedByDESC = [
    //   keyNames[3].split(':')[1],
    //   keyNames[2].split(':')[1],
    //   keyNames[1].split(':')[1],
    //   keyNames[0].split(':')[1],
    //   keyNames[5],
    //   keyNames[4],
    // ]

    // Create 5 keys
    for (const key of stringKeys) {
      await KeyAPIRequests.addStringKeyApi(
        { keyName: key, value: 'value' },
        Config.ossStandaloneConfig,
      )
    }
    for (const key of setKeys) {
      await KeyAPIRequests.addSetKeyApi(
        { keyName: key, members: ['value'] },
        Config.ossStandaloneConfig,
      )
    }
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(KeyTreeView.treeFrame)

    // Verify that if there are keys without namespaces, they are displayed in the root directory after all folders by default in the Tree view
    await keyTreeView.openTreeFolders([`${keyNames[0]}`.split(':')[0]])
    await keyTreeView.openTreeFolders([`${keyNames[2]}`.split(':')[0]])
    const actualItemsArray = await keyTreeView.getAllKeysArray()
    // Verify that user can see all folders and keys sorted by name ASC by default
    expect(actualItemsArray).eql(expectedSortedByASC)

    // Verify that user can change the sorting ASC-DESC - will be added in future with delimiter feature
  })
})

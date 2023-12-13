import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  KeyDetailsView,
  KeyTreeView,
} from '@e2eSrc/page-objects/components'

describe('Tree view verifications', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let keyDetailsView: KeyDetailsView
  let keyTreeView: KeyTreeView
  let sideBarView: SideBarView | undefined

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()
    await webView.switchToFrame(KeyTreeView.treeFrame)
  })
  afterEach(async () => {
    await webView.switchBack()
  })
  // Run this test only for database instanse without keys
  it.skip('Verify that user can see message "No keys to display." when there are no keys in the database', async function () {
    const message = 'Keys are the foundation of Redis.'

    expect(await keyTreeView.getElementText(keyTreeView.treeViewPage)).eql(
      message,
      'Tree view no keys message not shown',
    )
  })
  // Run this test only for big database instanse 8103
  it.skip('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view and Browser view', async function () {
    // Verify the controls on the Browser view

    // Verify the controls on the Tree view
    expect(await keyTreeView.isElementDisplayed(keyTreeView.scanMoreBtn)).eql(
      true,
      'Tree view Scan more button not displayed for big database',
    )
  })
})

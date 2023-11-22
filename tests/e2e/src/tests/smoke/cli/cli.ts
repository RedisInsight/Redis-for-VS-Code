import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'

import {
  VSBrowser,
  WebDriver,
  ActivityBar,
  SideBarView,
  WebView,
} from 'vscode-extension-tester'
import { BottomBar } from '../../../page-objects/bottom-bar/BottomBar'

describe('CLI', () => {
  let browser: VSBrowser
  let driver: WebDriver
  let view: SideBarView | undefined
  let webView: WebView
  let bottomBar: BottomBar

  // initialize the browser and webdriver
  beforeEach(async () => {
    browser = VSBrowser.instance
    driver = browser.driver

    await browser.waitForWorkbench(20_000)
    view = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()
  })

  afterEach(async () => {
    await webView.switchBack()
    await (await new ActivityBar().getViewControl('RedisInsight'))?.closeView()
  })
  it('Verify that user can add data via CLI', async function () {
    // to set time out for hole test
    this.timeout(30_000)

    webView = new WebView()
    bottomBar = new BottomBar()

    await view?.getContent().wait()
    console.log('Bottom bar panel maximized')

    console.log('Bottom bar initialized')
    const cliView = await bottomBar.openCliView()

    await cliView.switchToFrame()

    await cliView.executeCommand('info')
    const text = await cliView.getText()
    expect(text).contain('redis_version:6.2.6')
  })
})

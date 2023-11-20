// import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha'

// import the webdriver and the high level browser wrapper
import {
  VSBrowser,
  WebDriver,
  ActivityBar,
  SideBarView,
  // ExtensionsViewSection,
} from 'vscode-extension-tester'

describe('CLI', () => {
  let browser: VSBrowser
  let driver: WebDriver
  let view: SideBarView | undefined

  // initialize the browser and webdriver
  beforeEach(async () => {
    browser = VSBrowser.instance
    driver = browser.driver

    await browser.waitForWorkbench(20_000)
    view = await (
      await new ActivityBar().getViewControl('Extensions')
    )?.openView()
  })

  afterEach(async () => {
    await (await new ActivityBar().getViewControl('Extensions'))?.closeView()
  })
  it('Verify that user can add data via CLI', async function () {
    // to set time out for hole test
    this.timeout(30_000)
    await driver.sleep(20000)
  })
})

import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  CliViewPanel,
  KeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { InputActions } from '@e2eSrc/helpers/common-actions'
import { Common } from '@e2eSrc/helpers/Common'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

describe('Key Details verifications', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: KeyDetailsView
  let sideBarView: SideBarView | undefined

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await bottomBar.openTerminalView()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(CliViewPanel.cliFrame)
    await cliViewPanel.executeCommand(`FLUSHDB`)
  })
  it.skip('Verify that user can see string details', async function () {
    const ttlValue = '2147476121'
    const expectedTTL = /214747612*/
    const testStringValue = 'stringValue'
    const keyName = Common.generateWord(20)

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(CliViewPanel.cliFrame)

    const command = `SET ${keyName} \"${testStringValue}\" EX ${ttlValue}`
    await cliViewPanel.executeCommand(`${command}`)
    await webView.switchBack()

    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    //TODO click on string
    await CommonDriverExtension.driverSleep()

    await webView.switchToFrame(KeyDetailsView.keyFrame)

    await CommonDriverExtension.driverSleep()

    const keyType = await InputActions.getFieldValue(keyDetailsView.keyType)
    const enteredKeyName = await InputActions.getFieldValue(
      keyDetailsView.keyName,
    )
    const keySize = await keyDetailsView.getKeySize()
    const keyLength = await keyDetailsView.getKeyLength()
    const keyTtl = Number(await keyDetailsView.getKeyTtl())
    const keyValue = await InputActions.getFieldValue(
      keyDetailsView.keyStringValue,
    )

    expect(keyType).contain('String', 'Type is incorrect')
    expect(enteredKeyName).eq(keyName, 'Name is incorrect')
    expect(keySize).greaterThan(0, 'Size is 0')
    expect(keyLength).greaterThan(0, 'Length is 0')
    expect(keyTtl).match(expectedTTL, 'The Key TTL is incorrect')
    expect(keyValue).eq(testStringValue, 'Value is incorrect')
  })
})

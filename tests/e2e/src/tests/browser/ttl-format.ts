import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  CliViewPanel,
  KeyDetailsView,
  KeyTreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { COMMANDS_TO_CREATE_KEY, keyLength } from '@e2eSrc/helpers/constants'
import { keyTypes } from '@e2eSrc/helpers/KeysActions'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { KeyDetailsActions } from '@e2eSrc/helpers/common-actions'

const keysData = keyTypes.map(object => ({ ...object })).slice(0, 6)
for (const key of keysData) {
  key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`
}
// Arrays with TTL in seconds, min, hours, days, months, years and their values in Browser Page
const ttlForSet = [59, 800, 20000, 2000000, 31000000, 2147483647]
const ttlValues = ['s', '13 min', '5 h', '23 d', '11 mo', '68 yr']

describe('TTL values in Keys Table', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: KeyDetailsView
  let keyTreeView: KeyTreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()
    keyTreeView = new KeyTreeView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await bottomBar.openTerminalView()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)
    await cliViewPanel.executeCommand(`FLUSHDB`)
  })

  it.skip('Verify that Key is deleted if TTL finishes', async function () {
    // Create new key with TTL
    const TTL = 15
    let ttlToCompare = TTL
    const keyName = Common.generateWord(10)

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)

    await cliViewPanel.executeCommand(`set ${keyName} EXPIRE ${TTL}`)

    await webView.switchBack()
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await CommonDriverExtension.driverSleep()
    await webView.switchToFrame(Views.KeyDetailsView)

    //TODO verify that the key is really added

    await CommonDriverExtension.driverSleep(TTL)

    //TODO verify that the key is really deleted
  })

  it('Verify that user can see TTL in the list of keys rounded down to the nearest unit', async function () {
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)

    for (let i = 0; i < keysData.length; i++) {
      await cliViewPanel.executeCommand(
        `${COMMANDS_TO_CREATE_KEY[keysData[i].textType](
          keysData[i].keyName,
        )} EXPIRE ${ttlForSet[i]}`,
      )
    }
    await webView.switchBack()
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()

    // Check that Keys has correct TTL value in keys table
    for (let i = 0; i < keysData.length; i++) {
      // Open key details iframe
      await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
        keysData[i].keyName,
      )
      expect(await keyDetailsView.getKeyTtl()).contains(
        ttlValues[i],
        `TTL value in keys table is not ${ttlValues[i]}`,
      )
      await webView.switchBack()
    }
  })
})

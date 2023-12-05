import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'

import {
  BottomBarPanel,
  VSBrowser,
  WebDriver,
  until,
} from 'vscode-extension-tester'
import { BottomBar } from '../../../page-objects/components/bottom-bar/BottomBar'
import { WebView } from '../../../page-objects/components/WebView'
import { CliView } from '../../../page-objects/components/bottom-bar/CliView'
import { Input } from '../../../page-objects/components/inputs/Input'
import { Common } from '../../../helpers/Common'
// import { KeyAPIRequests } from '../../../helpers/api/KeyApi'
// import { Config } from '../../../helpers/Conf'

describe('CLI regression', () => {
  let browser: VSBrowser
  let driver: WebDriver
  let webView: WebView
  let bottomBar: BottomBar
  let cliView: CliView
  let panel: BottomBarPanel
  let input: Input
  let keyName = Common.generateWord(20)

  beforeEach(async () => {
    browser = VSBrowser.instance
    driver = browser.driver
    bottomBar = new BottomBar()
    webView = new WebView()
    panel = new BottomBarPanel()
    input = new Input()

    await browser.waitForWorkbench(20_000)
    cliView = await bottomBar.openCliView()
    await webView.switchToFrame(WebView.webViewFrame)
  })
  afterEach(async () => {
    await webView.switchBack()
    await panel.openTerminalView()
    // await KeyAPIRequests.deleteKeyByNameApi(
    //   keyName,
    //   Config.ossStandaloneConfig.databaseName,
    // )
  })
  it('Verify that user can repeat commands by entering a number of repeats before the Redis command in CLI', async function () {
    keyName = Common.generateWord(20)
    const command = `SET ${keyName} a`
    const repeats = 10

    // Run CLI command with repeats
    await cliView.executeCommand(`${repeats} ${command}`)
    await driver.wait(
      until.elementLocated(cliView.cliOutputResponseSuccess),
      5000,
    )
    const count = (await driver.findElements(cliView.cliOutputResponseSuccess))
      .length

    expect(count).eql(repeats, `CLI not contains ${repeats} results`)
  })
  // Update after adding treeView class or updating api methods for keys creation
  it.skip('Verify that user can run command json.get and see JSON object with escaped quotes (" instead of ")', async function () {
    keyName = Common.generateWord(20)
    const jsonValueCli = '"{\\"name\\":\\"xyz\\"}"'
    const command = `JSON.GET ${keyName}`

    // Add Json key with json object
    // await browserPage.addJsonKey(keyName, jsonValue, keyTTL)
    await cliView.executeCommand(command)
    // Verify result
    const text = await cliView.getCliLastCommandResponse()
    expect(text).contain(
      jsonValueCli,
      'The user can not see JSON object with escaped quotes',
    )
  })
  it('Verify that user can use "Up" and "Down" keys to view previous commands in CLI in the application', async function () {
    const cliCommands = ['get test', 'acl help', 'client list']

    for (const command of cliCommands) {
      await cliView.executeCommand(command)
    }

    const inputField = await driver.wait(
      until.elementLocated(cliView.cliCommand),
      5000,
    )
    for (let i = cliCommands.length - 1; i >= 0; i--) {
      await input.pressKey(inputField, 'up')
      expect(await cliView.getCommandText()).eql(cliCommands[i])
    }
    for (let i = 0; i < cliCommands.length; i++) {
      console.log(`NExt Iteration ` + i)
      expect(await cliView.getCommandText()).eql(cliCommands[i])
      await input.pressKey(inputField, 'down')
    }
  })
})

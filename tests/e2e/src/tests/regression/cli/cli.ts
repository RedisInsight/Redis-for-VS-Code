import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  CliViewPanel,
} from '@e2eSrc/page-objects/components'
import { InputActions } from '@e2eSrc/helpers/common-actions'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { JsonKeyParameters } from '@e2eSrc/helpers/types/types'

describe('CLI regression', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyName = Common.generateWord(20)

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()

    await browser.waitForWorkbench(20_000)
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(CliViewPanel.cliFrame)
  })
  afterEach(async () => {
    await webView.switchBack()
    await bottomBar.openTerminalView()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can repeat commands by entering a number of repeats before the Redis command in CLI', async function () {
    keyName = Common.generateWord(20)
    const command = `SET ${keyName} a`
    const repeats = 10

    // Run CLI command with repeats
    await cliViewPanel.executeCommand(`${repeats} ${command}`)
    await cliViewPanel.getElement(cliViewPanel.cliOutputResponseSuccess)
    const count = await cliViewPanel.getCliResponsesCount()

    expect(count).eql(repeats, `CLI not contains ${repeats} results`)
  })
  it('Verify that user can run command json.get and see JSON object with escaped quotes (" instead of ")', async function () {
    keyName = Common.generateWord(20)
    const jsonValueCli = '"{\\"name\\":\\"xyz\\"}"'
    const jsonValue = '{"name":"xyz"}'
    const command = `JSON.GET ${keyName}`
    const jsonKeyParameters: JsonKeyParameters = {
      keyName: keyName,
      data: jsonValue,
    }

    // Add Json key with json object
    await KeyAPIRequests.addJsonKeyApi(
      jsonKeyParameters,
      Config.ossStandaloneConfig,
    )
    await cliViewPanel.executeCommand(command)
    // Verify result
    const text = await cliViewPanel.getCliLastCommandResponse()
    expect(text).contain(
      jsonValueCli,
      'The user can not see JSON object with escaped quotes',
    )
  })
  it('Verify that user can use "Up" and "Down" keys to view previous commands in CLI in the application', async function () {
    const cliCommands = ['get test', 'acl help', 'client list']

    for (const command of cliCommands) {
      await cliViewPanel.executeCommand(command)
    }

    const inputField = await cliViewPanel.getElement(cliViewPanel.cliCommand)
    for (let i = cliCommands.length - 1; i >= 0; i--) {
      await InputActions.pressKey(inputField, 'up')
      expect(await cliViewPanel.getCommandText()).eql(cliCommands[i])
    }
    for (let i = 0; i < cliCommands.length; i++) {
      expect(await cliViewPanel.getCommandText()).eql(cliCommands[i])
      await InputActions.pressKey(inputField, 'down')
    }
  })
})
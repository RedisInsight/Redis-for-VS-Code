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

describe('CLI critical', () => {
  let browser: VSBrowser
  let driver: WebDriver
  let webView: WebView
  let bottomBar: BottomBar
  let cliView: CliView
  let panel: BottomBarPanel
  let input: Input

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
  })
  it('Verify that Redis returns error if command is not correct when user works with CLI', async function () {
    await cliView.executeCommand('SET key')
    let cliOutput = await cliView.getCliLastCommandResponse()
    expect(cliOutput).contain("ERR wrong number of arguments for 'set' command")
    await cliView.executeCommand('lorem')
    cliOutput = await cliView.getCliLastCommandResponse()
    expect(cliOutput).contain(
      'ERR unknown command `lorem`, with args beginning with: ',
    )
  })
  it('Verify that user can scroll commands using "Tab" in CLI & execute it', async function () {
    const commandToAutoComplete = 'INFO'
    const commandStartsWith = 'I'
    const maxAutocompleteExecutios = 100

    await cliView.typeCommand(commandStartsWith)
    // Press tab while we won't find 'INFO' command
    // Avoid endless cycle
    const inputField = await driver.wait(
      until.elementLocated(cliView.cliCommand),
      5000,
    )
    let operationsCount = 0
    while (
      (await cliView.getCommandText()) !== commandToAutoComplete &&
      operationsCount < maxAutocompleteExecutios
    ) {
      await input.pressKey(inputField, 'tab')
      ++operationsCount
    }

    await input.pressKey(inputField, 'enter')

    const text = await cliView.getCliLastCommandResponse()
    expect(text).contain('redis_version:6.2.6')
  })
  it('Verify that when user enters in CLI RediSearch/JSON commands (FT.CREATE, FT.DROPINDEX/JSON.GET, JSON.DEL), he can see hints with arguments', async function () {
    const commandHints = [
      'index [data_type] [prefix] [filter] [default_lang] [lang_attribute] [default_score] [score_attribute] [payload_attribute] [maxtextfields] [seconds] [nooffsets] [nohl] [nofields] [nofreqs] [stopwords] [skipinitialscan] schema field [field ...]',
      'index [delete docs]',
      'key [indent] [newline] [space] [path [path ...]]',
      'key [path]',
    ]
    const commands = ['FT.CREATE', 'FT.DROPINDEX', 'JSON.GET', 'JSON.DEL']
    const commandHint = 'key [META] [BLOB]'
    const command = 'ai.modelget'

    await cliView.typeCommand(command)
    // Verify that user can type AI command in CLI and see agruments in hints from RedisAI commands.json
    expect(await cliView.getAutocompleteText()).eql(
      commandHint,
      `The hints with arguments for command ${command} not shown`,
    )

    // Enter commands and check hints with arguments
    for (const command of commands) {
      await cliView.typeCommand(command)
      expect(await cliView.getAutocompleteText()).eql(
        commandHints[commands.indexOf(command)],
        `The hints with arguments for command ${command} not shown`,
      )
    }
  })
})

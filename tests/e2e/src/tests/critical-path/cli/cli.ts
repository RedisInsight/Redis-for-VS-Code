import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'

import { BottomBarPanel, VSBrowser } from 'vscode-extension-tester'
import { BottomBar } from '../../../page-objects/components/bottom-bar/BottomBar'
import { WebView } from '../../../page-objects/components/WebView'
import { CliViewPanel } from '../../../page-objects/components/bottom-bar/CliViewPanel'
import { InputActions } from '../../../helpers/common-actions/input-actions/InputActions'

describe('CLI critical', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let panel: BottomBarPanel

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    panel = new BottomBarPanel()

    await browser.waitForWorkbench(20_000)
    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(CliViewPanel.cliFrame)
  })
  afterEach(async () => {
    await webView.switchBack()
    await panel.openTerminalView()
  })
  it('Verify that Redis returns error if command is not correct when user works with CLI', async function () {
    await cliViewPanel.executeCommand('SET key')
    let cliOutput = await cliViewPanel.getCliLastCommandResponse()
    expect(cliOutput).contain("ERR wrong number of arguments for 'set' command")
    await cliViewPanel.executeCommand('lorem')
    cliOutput = await cliViewPanel.getCliLastCommandResponse()
    expect(cliOutput).contain(
      'ERR unknown command `lorem`, with args beginning with: ',
    )
  })
  it('Verify that user can scroll commands using "Tab" in CLI & execute it', async function () {
    const commandToAutoComplete = 'INFO'
    const commandStartsWith = 'I'
    const maxAutocompleteExecutios = 100

    await cliViewPanel.typeCommand(commandStartsWith)
    // Press tab while we won't find 'INFO' command
    // Avoid endless cycle
    const inputField = await cliViewPanel.getElement(cliViewPanel.cliCommand)
    let operationsCount = 0
    while (
      (await cliViewPanel.getCommandText()) !== commandToAutoComplete &&
      operationsCount < maxAutocompleteExecutios
    ) {
      await InputActions.pressKey(inputField, 'tab')
      ++operationsCount
    }

    await InputActions.pressKey(inputField, 'enter')

    const text = await cliViewPanel.getCliLastCommandResponse()
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

    await cliViewPanel.typeCommand(command)
    // Verify that user can type AI command in CLI and see agruments in hints from RedisAI commands.json
    expect(await cliViewPanel.getAutocompleteText()).eql(
      commandHint,
      `The hints with arguments for command ${command} not shown`,
    )

    // Enter commands and check hints with arguments
    for (const command of commands) {
      await cliViewPanel.typeCommand(command)
      expect(await cliViewPanel.getAutocompleteText()).eql(
        commandHints[commands.indexOf(command)],
        `The hints with arguments for command ${command} not shown`,
      )
    }
  })
})

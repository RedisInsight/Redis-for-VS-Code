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
import { JsonKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { Views } from '@e2eSrc/page-objects/components/WebView'

describe('CLI critical', () => {
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
    await webView.switchToFrame(Views.CliViewPanel)
  })
  afterEach(async () => {
    await webView.switchBack()
    await bottomBar.openTerminalView()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
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
    expect(text).contain('redis_version:')
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
      Config.ossStandaloneConfig.databaseName,
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
  it('Verify that user can send command via CLI', async function () {
    keyName = Common.generateWord(10)
    await cliViewPanel.executeCommand('info')
    const text = await cliViewPanel.getCliLastCommandResponse()
    expect(text).contain('redis_version:')
  })
  // Update once treeView class added
  it.skip('Verify that user can add data via CLI', async function () {
    await cliViewPanel.executeCommand(
      `SADD ${keyName} "chinese" "japanese" "german"`,
    )
    // Search key and find created key in Tree view
  })
  it('Verify that user can use blocking command', async function () {
    await cliViewPanel.executeCommand('blpop newKey 10000')
    await CommonDriverExtension.driverSleep(2000)
    const text = await cliViewPanel.getCliText()
    expect(text).contain('Executing command...')
  })
})

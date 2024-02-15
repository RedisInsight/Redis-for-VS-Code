import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  CliViewPanel,
  TreeView,
} from '@e2eSrc/page-objects/components'
import { DatabasesActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { Common } from '@e2eSrc/helpers/Common'
import { JsonKeyParameters } from '@e2eSrc/helpers/types/types'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { ButtonActions } from '@e2eSrc/helpers/common-actions'

describe('CLI critical', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let sideBarView: SideBarView | undefined
  let treeView: TreeView

  let keyName = Common.generateWord(20)

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
    await webView.switchBack()
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
    await DatabaseAPIRequests.deleteAllDatabasesApi()
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
  it('Verify that user can add data via CLI', async function () {
    await cliViewPanel.executeCommand(
      `SADD ${keyName} "chinese" "japanese" "german"`,
    )

    await webView.switchBack()
    // should be removed when iframe get unic locator
    await bottomBar.toggle(false)
    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(Views.TreeView)
    await treeView.openKeyDetailsByKeyName(keyName)
  })
  it('Verify that user can use blocking command', async function () {
    await cliViewPanel.executeCommand('blpop newKey 10000')
    await CommonDriverExtension.driverSleep(2000)
    const text = await cliViewPanel.getCliText()
    expect(text).contain('Executing command...')
  })
  it('Verify that user can switch between CLI instances', async function () {
    const dbAddress =
      Config.ossStandaloneConfig.host + ':' + Config.ossStandaloneConfig.port
    const text = await cliViewPanel.getCliText()
    // Verify that user can see db instance host and port in CLI
    expect(text).contain(`Pinging Redis server on ${dbAddress}`)

    await cliViewPanel.executeCommand('info')
    await webView.switchBack()

    await ButtonActions.clickElement(cliViewPanel.addCliBtn, 5000)

    await webView.switchToFrame(Views.CliViewPanel)
    // Verify that user can see the list of all active CLI instances
    expect(await cliViewPanel.getCliInstancesCount()).eql(2)
    expect(
      await cliViewPanel.getElementText(cliViewPanel.cliInstanceByIndex(1)),
    ).eql(dbAddress)
    expect(
      await cliViewPanel.getElementText(cliViewPanel.cliInstanceByIndex(2)),
    ).eql(dbAddress)

    await ButtonActions.clickElement(cliViewPanel.cliInstanceByIndex(1))
    // Verify that user can switch between CLI instances
    expect(await cliViewPanel.getCliLastCommandResponse()).contain(
      'redis_version:',
    )

    // Verify that user can not see CLI instances panel when only one instance added
    await ButtonActions.hoverElement(cliViewPanel.cliInstanceByIndex(1))
    await ButtonActions.clickElement(cliViewPanel.cliInstanceDeleteBtn)
    expect(
      await cliViewPanel.isElementDisplayed(cliViewPanel.cliInstancesPanel),
    ).ok('CLI instances panel displayed after deleting')
  })
})

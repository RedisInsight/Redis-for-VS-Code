import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  CliViewPanel,
  StringKeyDetailsView,
  KeyTreeView,
  HashKeyDetailsView,
  SortedSetKeyDetailsView,
  ListKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { KeyDetailsActions } from '@e2eSrc/helpers/common-actions'

const keyTTL = '2147476121'
const expectedTTL = /214747612*/
let keyName: string

describe('Key Details verifications', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: StringKeyDetailsView
  let keyTreeView: KeyTreeView
  let stringKeyDetailsView: StringKeyDetailsView
  let hashKeyDetailsView: HashKeyDetailsView
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView
  let listKeyDetailsView: ListKeyDetailsView

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new StringKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()
    keyTreeView = new KeyTreeView()
    hashKeyDetailsView = new HashKeyDetailsView()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()
    listKeyDetailsView = new ListKeyDetailsView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can see string details', async function () {
    const ttlValue = '2147476121'
    const expectedTTL = /214747612*/
    const testStringValue = 'stringValue'
    keyName = Common.generateWord(20)

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)

    const command = `SET ${keyName} \"${testStringValue}\" EX ${ttlValue}`
    await cliViewPanel.executeCommand(`${command}`)
    await webView.switchBack()
    await bottomBar.toggle(false)

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await CommonDriverExtension.driverSleep()

    const keyType = await keyDetailsView.getElementText(
      stringKeyDetailsView.keyType,
    )
    const enteredKeyName = await stringKeyDetailsView.getElementText(
      stringKeyDetailsView.keyName,
    )
    const keySize = await stringKeyDetailsView.getKeySize()
    const keyLength = await stringKeyDetailsView.getKeyLength()
    const keyTtl = Number(await stringKeyDetailsView.getKeyTtl())
    const keyValue = await stringKeyDetailsView.getElementText(
      stringKeyDetailsView.keyStringValue,
    )

    expect(keyType).contain('String', 'Type is incorrect')
    expect(enteredKeyName).eq(keyName, 'Name is incorrect')
    expect(keySize).greaterThan(0, 'Size is 0')
    expect(keyLength).greaterThan(0, 'Length is 0')
    expect(keyTtl).match(expectedTTL, 'The Key TTL is incorrect')
    expect(keyValue).eq(testStringValue, 'Value is incorrect')
  })

  it('Verify that user can see Hash Key details', async function () {
    keyName = Common.generateWord(10)

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)

    const command = `HSET ${keyName} \"\" \"\"`
    await cliViewPanel.executeCommand(`${command}`)
    const command2 = `expire ${keyName} \"${keyTTL}\" `
    await cliViewPanel.executeCommand(`${command2}`)
    await webView.switchBack()
    await bottomBar.toggle(false)

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const keyType = await hashKeyDetailsView.getElementText(
      hashKeyDetailsView.keyType,
    )
    const enteredKeyName = await hashKeyDetailsView.getElementText(
      hashKeyDetailsView.keyName,
    )
    const keySize = await hashKeyDetailsView.getKeySize()
    const keyLength = await hashKeyDetailsView.getKeyLength()
    const keyTtl = Number(await hashKeyDetailsView.getKeyTtl())

    expect(keyType).contains('Hash', 'Type is incorrect')
    expect(enteredKeyName).eq(keyName, 'Name is incorrect')
    expect(keySize).greaterThan(0, 'Size is 0')
    expect(keyLength).greaterThan(0, 'Length is 0')
    expect(keyTtl).match(expectedTTL, 'The Key TTL is incorrect')
  })

  it('Verify that user can see Sorted Set Key details', async function () {
    keyName = Common.generateWord(20)
    const ttl = '121212'
    const value = 'value'
    const score = 1

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)

    const command = `ZADD ${keyName} ${score} \"${value}\"`
    await cliViewPanel.executeCommand(`${command}`)
    const command2 = `expire ${keyName} \"${ttl}\" `
    await cliViewPanel.executeCommand(`${command2}`)
    await webView.switchBack()
    await bottomBar.toggle(false)

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await sortedSetKeyDetailsView.getElementText(
        sortedSetKeyDetailsView.keyType,
      ),
    ).contain('Sorted Set', 'Type is incorrect')
    expect(
      await sortedSetKeyDetailsView.getElementText(
        sortedSetKeyDetailsView.keyName,
      ),
    ).eq(keyName, 'Name is incorrect')
    expect(await sortedSetKeyDetailsView.getKeySize()).greaterThan(
      0,
      'Size is 0',
    )
    expect(await sortedSetKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(Number(await sortedSetKeyDetailsView.getKeyTtl())).match(
      expectedTTL,
      'The Key TTL is incorrect',
    )
  })

  it('Verify that user can see List Key details', async function () {
    keyName = Common.generateWord(20)
    const ttl = '121212'
    const element = 'element1'

    cliViewPanel = await bottomBar.openCliViewPanel()
    await webView.switchToFrame(Views.CliViewPanel)

    const command = `LPUSH ${keyName} \"${element}\"`
    await cliViewPanel.executeCommand(`${command}`)
    const command2 = `expire ${keyName} \"${ttl}\" `
    await cliViewPanel.executeCommand(`${command2}`)
    await webView.switchBack()
    await bottomBar.toggle(false)

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.keyType,
      ),
    ).contain('List', 'Type is incorrect')
    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.keyName,
      ),
    ).eq(keyName, 'Name is incorrect')
    expect(await listKeyDetailsView.getKeySize()).greaterThan(
      0,
      'Size is 0',
    )
    expect(await listKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(Number(await listKeyDetailsView.getKeyTtl())).match(
      expectedTTL,
      'The Key TTL is incorrect',
    )
  })
})

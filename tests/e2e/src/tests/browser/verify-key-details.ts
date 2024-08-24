import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import {
  StringKeyDetailsView,
  TreeView,
  HashKeyDetailsView,
  SortedSetKeyDetailsView,
  ListKeyDetailsView,
  SetKeyDetailsView,
  JsonKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  CliAPIRequests,
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { AddStringKeyView } from '@e2eSrc/page-objects/components/editor-view/AddStringKeyView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { JsonKeyParameters } from '@e2eSrc/helpers/types/types'

const keyTTL = '2147476121'
const expectedTTL = /214747612*/
let keyName: string

describe('Key Details verifications', () => {
  let keyDetailsView: StringKeyDetailsView
  let treeView: TreeView
  let stringKeyDetailsView: StringKeyDetailsView
  let hashKeyDetailsView: HashKeyDetailsView
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView
  let listKeyDetailsView: ListKeyDetailsView
  let setKeyDetailsView: SetKeyDetailsView
  let jsonKeyDetailsView: JsonKeyDetailsView
  let addStringKeyView: AddStringKeyView

  before(async () => {
    keyDetailsView = new StringKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()
    treeView = new TreeView()
    hashKeyDetailsView = new HashKeyDetailsView()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()
    listKeyDetailsView = new ListKeyDetailsView()
    setKeyDetailsView = new SetKeyDetailsView()
    jsonKeyDetailsView = new JsonKeyDetailsView()
    addStringKeyView = new AddStringKeyView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await keyDetailsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  it('Verify that user can see string details', async function () {
    const ttlValue = '2147476121'
    const expectedTTL = /214747612*/
    const testStringValue = 'stringValue'
    keyName = Common.generateWord(20)

    await ButtonActions.clickElement(treeView.addKeyButton)
    await treeView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await addStringKeyView.selectKeyTypeByValue(KeyTypesShort.String)
    await InputActions.typeText(addStringKeyView.ttlInput, ttlValue)
    await InputActions.typeText(
      addStringKeyView.stringValueInput,
      testStringValue,
    )

    const isDisabled = await addStringKeyView.isElementDisabled(
      addStringKeyView.addButton,
      'class',
    )
    expect(isDisabled).eql(
      true,
      'Add button not disabled when required fields not filled',
    )

    await InputActions.typeText(addStringKeyView.keyNameInput, keyName)
    await NotificationActions.closeAllNotifications()

    await ButtonActions.clickElement(addStringKeyView.addButton)
    await addStringKeyView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)

    // check the key details
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const keyType = await keyDetailsView.getElementText(
      stringKeyDetailsView.keyType,
    )
    const enteredKeyName = await InputActions.getInputValue(
      stringKeyDetailsView.keyNameInput,
    )
    const keySize = await stringKeyDetailsView.getKeySize()
    const keyLength = await stringKeyDetailsView.getKeyLength()
    const keyTtl = Number(
      await InputActions.getInputValue(keyDetailsView.editTtlInput),
    )
    const keyValue = await stringKeyDetailsView.getElementText(
      stringKeyDetailsView.stringKeyValueInput,
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
    await CliAPIRequests.sendRedisCliCommandApi(
      `HSET ${keyName} \"\" \"\"`,
      Config.ossStandaloneConfig,
    )
    await CliAPIRequests.sendRedisCliCommandApi(
      `expire ${keyName} ${keyTTL}`,
      Config.ossStandaloneConfig,
    )

    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const keyType = await hashKeyDetailsView.getElementText(
      hashKeyDetailsView.keyType,
    )
    const enteredKeyName = await InputActions.getInputValue(
      stringKeyDetailsView.keyNameInput,
    )
    const keySize = await hashKeyDetailsView.getKeySize()
    const keyLength = await hashKeyDetailsView.getKeyLength()
    const keyTtl = Number(
      await InputActions.getInputValue(keyDetailsView.editTtlInput),
    )
    expect(keyType).contains('Hash', 'Type is incorrect')
    expect(enteredKeyName).eq(keyName, 'Name is incorrect')
    expect(keySize).greaterThan(0, 'Size is 0')
    expect(keyLength).greaterThan(0, 'Length is 0')
    expect(keyTtl).match(expectedTTL, 'The Key TTL is incorrect')
  })

  it('Verify that user can see Sorted Set Key details', async function () {
    keyName = Common.generateWord(20)
    const value = 'value'
    const score = 1

    await CliAPIRequests.sendRedisCliCommandApi(
      `ZADD ${keyName} ${score} \"${value}\"`,
      Config.ossStandaloneConfig,
    )
    await CliAPIRequests.sendRedisCliCommandApi(
      `expire ${keyName} ${keyTTL}`,
      Config.ossStandaloneConfig,
    )

    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await sortedSetKeyDetailsView.getElementText(
        sortedSetKeyDetailsView.keyType,
      ),
    ).contain('Sorted Set', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(stringKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await sortedSetKeyDetailsView.getKeySize()).greaterThan(
      0,
      'Size is 0',
    )
    expect(await sortedSetKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(
      Number(await InputActions.getInputValue(keyDetailsView.editTtlInput)),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })

  it('Verify that user can see List Key details', async function () {
    keyName = Common.generateWord(20)
    const ttl = '121212'
    const element = 'element1'

    await CliAPIRequests.sendRedisCliCommandApi(
      `LPUSH ${keyName} \"${element}\"`,
      Config.ossStandaloneConfig,
    )
    await CliAPIRequests.sendRedisCliCommandApi(
      `expire ${keyName} ${keyTTL}`,
      Config.ossStandaloneConfig,
    )

    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await listKeyDetailsView.getElementText(listKeyDetailsView.keyType),
    ).contain('List', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(stringKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await listKeyDetailsView.getKeySize()).greaterThan(0, 'Size is 0')
    expect(await listKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(
      Number(await InputActions.getInputValue(keyDetailsView.editTtlInput)),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })

  it('Verify that user can see Set Key details', async function () {
    keyName = Common.generateWord(20)
    const value = 'value'

    await CliAPIRequests.sendRedisCliCommandApi(
      `SADD ${keyName} \"${value}\"`,
      Config.ossStandaloneConfig,
    )
    await CliAPIRequests.sendRedisCliCommandApi(
      `expire ${keyName} ${keyTTL}`,
      Config.ossStandaloneConfig,
    )

    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await setKeyDetailsView.getElementText(setKeyDetailsView.keyType),
    ).contain('Set', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(stringKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await setKeyDetailsView.getKeySize()).greaterThan(0, 'Size is 0')
    expect(await setKeyDetailsView.getKeyLength()).greaterThan(0, 'Length is 0')
    expect(
      Number(await InputActions.getInputValue(keyDetailsView.editTtlInput)),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })

  it('Verify that user can see JSON Key details', async function () {
    keyName = Common.generateWord(20)
    const jsonValue =
      '{"employee":{ "name":"John", "age":30, "city":"New York" }}'
    const jsonKeyParameters: JsonKeyParameters = {
      keyName: keyName,
      data: jsonValue,
      expire: +keyTTL,
    }
    await KeyAPIRequests.addJsonKeyApi(
      jsonKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )

    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await jsonKeyDetailsView.getElementText(jsonKeyDetailsView.keyType),
    ).contain('JSON', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(jsonKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await jsonKeyDetailsView.getKeySize()).greaterThan(0, 'Size is 0')
    expect(await jsonKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(
      Number(await InputActions.getInputValue(jsonKeyDetailsView.editTtlInput)),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })
})

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, after, afterEach, EditorView } from 'vscode-extension-tester'
import {
  HashKeyDetailsView,
  TreeView,
  SortedSetKeyDetailsView,
  ListKeyDetailsView,
  StringKeyDetailsView,
  KeyDetailsView,
  AddStringKeyView,
  JsonKeyDetailsView,
  AddJsonKeyView,
  CliViewPanel,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  HashKeyParameters,
  JsonKeyParameters,
  ListKeyParameters,
  SortedSetKeyParameters,
  StringKeyParameters,
} from '@e2eSrc/helpers/types/types'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

let keyName: string
const keyValueBefore = 'ValueBeforeEdit!'
const keyValueAfter = 'ValueAfterEdit!'

describe('Edit Key values verification', () => {
  let hashKeyDetailsView: HashKeyDetailsView
  let treeView: TreeView
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView
  let listKeyDetailsView: ListKeyDetailsView
  let stringKeyDetailsView: StringKeyDetailsView
  let jsonKeyDetailsView: JsonKeyDetailsView
  let keyDetailsView: KeyDetailsView
  let addStringKeyView: AddStringKeyView
  let addJsonKeyView: AddJsonKeyView
  let cliViewPanel: CliViewPanel

  let keyNames: string[] = []

  before(async () => {
    hashKeyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()
    listKeyDetailsView = new ListKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()
    jsonKeyDetailsView = new JsonKeyDetailsView()
    keyDetailsView = new KeyDetailsView()
    addStringKeyView = new AddStringKeyView()
    addJsonKeyView = new AddJsonKeyView()
    cliViewPanel = new CliViewPanel()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await keyDetailsView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    for (const key of keyNames) {
      await KeyAPIRequests.deleteKeyIfExistsApi(
        key,
        Config.ossStandaloneConfig.databaseName,
      )
    }
    await new EditorView().closeAllEditors()
    await NotificationActions.closeAllNotifications()
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
  })

  it('Verify that user can edit Hash Key field', async function () {
    const fieldName = 'test'
    keyName = Common.generateWord(10)

    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: fieldName,
          value: keyValueBefore,
        },
      ],
    }
    await KeyAPIRequests.addHashKeyApi(
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await hashKeyDetailsView.editHashKeyValue(keyValueAfter, fieldName)
    let resultValue = await (
      await hashKeyDetailsView.getElements(hashKeyDetailsView.hashValuesList)
    )[0].getText()
    expect(resultValue).eqls(keyValueAfter)
  })

  it('Verify that user can edit Zset Key member', async function () {
    keyName = Common.generateWord(10)
    const scoreBefore = 5
    const scoreAfter = '10'
    const sortedSetKeyParameters: SortedSetKeyParameters = {
      keyName: keyName,
      members: [
        {
          name: keyValueBefore,
          score: scoreBefore,
        },
      ],
    }

    await KeyAPIRequests.addSortedSetKeyApi(
      sortedSetKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await sortedSetKeyDetailsView.editSortedSetKeyValue(scoreAfter, '0')
    let resultValue = await (
      await sortedSetKeyDetailsView.getElements(
        sortedSetKeyDetailsView.scoreSortedSetFieldsList,
      )
    )[0].getText()
    expect(resultValue).eqls(scoreAfter)
  })

  it('Verify that user can edit List Key element', async function () {
    keyName = Common.generateWord(10)
    const listKeyParameters: ListKeyParameters = {
      keyName: keyName,
      element: [keyValueBefore],
    }
    await KeyAPIRequests.addListKeyApi(
      listKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await listKeyDetailsView.editListKeyValue(keyValueAfter, '0')
    let resultValue = await (
      await listKeyDetailsView.getElements(listKeyDetailsView.elementsList)
    )[0].getText()
    expect(resultValue).eqls(keyValueAfter)
  })

  it('Verify that user can edit String value', async function () {
    keyName = Common.generateWord(10)
    const stringKeyParameters: StringKeyParameters = {
      keyName: keyName,
      value: keyValueBefore,
    }

    // Verify that user can add String Key
    await addStringKeyView.addKey(stringKeyParameters, KeyTypesShort.String)
    await addStringKeyView.switchBack()
    // Check the notification message that key added
    await NotificationActions.checkNotificationMessage(`Key has been added`)

    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)

    // Check the key value before edit
    let keyValue = await stringKeyDetailsView.getStringKeyValue()
    expect(keyValue).contains(keyValueBefore, 'The String value is incorrect')

    // Edit String key value
    await ButtonActions.clickElement(stringKeyDetailsView.stringKeyValueInput)
    await InputActions.typeText(
      stringKeyDetailsView.stringKeyValueInput,
      keyValueAfter,
    )

    // Verify that refresh is disabled for String key when editing value
    expect(
      await stringKeyDetailsView.isElementDisabled(
        stringKeyDetailsView.refreshKeyButton,
        'class',
      ),
    ).eql(true, 'Refresh button not disabled')

    await ButtonActions.clickElement(stringKeyDetailsView.applyBtn)
    // Check the key value after edit
    keyValue = await stringKeyDetailsView.getStringKeyValue()
    expect(keyValue).contains(keyValueAfter, 'Edited String value is incorrect')
  })

  it('Verify that user can edit JSON Key value', async function () {
    keyName = Common.generateWord(10)
    const jsonValue = '{"name":"xyz"}'
    const jsonValueBefore = '{name:"xyz"}'
    const jsonEditedValue = '"xyztest"'
    const jsonValueAfter = '{name:"xyztest"}'
    const keyTTL = '2147476121'
    const jsonKeyParameters: JsonKeyParameters = {
      keyName: keyName,
      data: jsonValue,
      expire: +keyTTL,
    }

    // Verify that user can add JSON Key
    await addJsonKeyView.addKey(jsonKeyParameters, KeyTypesShort.ReJSON)
    await addJsonKeyView.switchBack()
    // Check the notification message that key added
    await NotificationActions.checkNotificationMessage(`Key has been added`)

    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)

    // Check the key value before edit
    expect(
      Common.formatJsonString(
        await keyDetailsView.getElementText(jsonKeyDetailsView.jsonKeyValue),
      ),
    ).eql(jsonValueBefore, 'The JSON value is incorrect')

    // Edit JSON key value
    await ButtonActions.clickElement(jsonKeyDetailsView.jsonScalarValue)
    await InputActions.slowType(
      jsonKeyDetailsView.inlineItemEditor,
      jsonEditedValue,
    )

    // Verify that refresh is not disabled for JSON key when editing value
    expect(
      await jsonKeyDetailsView.isElementDisabled(
        jsonKeyDetailsView.refreshKeyButton,
        'class',
      ),
    ).eql(false, 'Refresh button disabled for JSON')
    await ButtonActions.clickAndWaitForElement(
      jsonKeyDetailsView.applyJsonInput,
      jsonKeyDetailsView.getJsonScalarValueByText(jsonEditedValue),
    )
    // Check JSON key value after edit
    expect(
      Common.formatJsonString(
        await keyDetailsView.getElementText(jsonKeyDetailsView.jsonKeyValue),
      ),
    ).eql(jsonValueAfter, 'Edited JSON value is incorrect')
  })

  it('Verify that user can see the message that data type not currently supported when open any of the unsupported data types', async function () {
    keyNames = [
      `stream-${Common.generateWord(10)}`,
      `graph-${Common.generateWord(10)}`,
      `timeSeries-${Common.generateWord(10)}`,
      `bloom-${Common.generateWord(10)}`,
    ]
    const unsupportedTypeMessage = 'This data type is not currently supported.'

    // Open CLI and create unsupported keys
    await treeView.openCliByDatabaseName(
      Config.ossStandaloneConfig.databaseName,
    )
    await treeView.switchBack()
    await CommonDriverExtension.driverSleep(1000)
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)
    // Create Stream key
    await cliViewPanel.executeCommand(`XADD ${keyNames[0]} * 'field' 'value'`)
    // Create Graph key
    await cliViewPanel.executeCommand(`GRAPH.QUERY ${keyNames[1]} "CREATE ()"`)
    // Create TimeSeries key
    await cliViewPanel.executeCommand(`TS.CREATE ${keyNames[2]}`)
    // Create BloomFilter key
    await cliViewPanel.executeCommand(`BF.RESERVE ${keyNames[3]} 0.001 50`)

    // Verify that unsupported key type message is displayed
    for (const key of keyNames) {
      await treeView.switchBack()
      await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )
      await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(key)
      expect(
        await keyDetailsView.getElementText(keyDetailsView.unsupportedTypeMessage),
      ).contains(
        unsupportedTypeMessage,
        'Unsupported key type message not displayed',
      )
    }
  })
})

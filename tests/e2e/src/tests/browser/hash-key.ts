import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import {
  AddHashKeyView,
  HashKeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonActions,
  DatabasesActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { EditorView } from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Hash Key fields verification', () => {
  let keyDetailsView: HashKeyDetailsView
  let treeView: TreeView
  let editorView: EditorView
  let addHashKeyView: AddHashKeyView

  before(async () => {
    keyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()
    editorView = new EditorView()
    addHashKeyView = new AddHashKeyView()

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
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  it('Verify that user can search by full field name in Hash', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'hashField11111'
    const keyValue = 'hashValue11111!'
    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: keyFieldValue,
          value: keyValue,
        },
      ],
    }

    // Verify that user can add Hash Key
    await addHashKeyView.addKey(hashKeyParameters, KeyTypesShort.Hash)
    await keyDetailsView.switchBack()
    // Check the notification message that key added
    await NotificationActions.checkNotificationMessage(
      `Key has been added`,
    )

    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)

    const commands = ['hashField*', '*11111', 'hash*11111']
    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await keyDetailsView.getElementText(
      keyDetailsView.hashFieldsList,
    )

    expect(result).contains(keyFieldValue)
    await ButtonActions.clickElement(keyDetailsView.clearSearchInput)

    for (const command of commands) {
      await keyDetailsView.searchByTheValueInKeyDetails(command)
      // Check the search result
      result = await keyDetailsView.getElementText(
        keyDetailsView.hashFieldsList,
      )
      expect(result).eqls(keyFieldValue)
      expect(
        (await keyDetailsView.getElements(keyDetailsView.hashFieldsList))
          .length,
      ).eqls(1)
      await ButtonActions.clickElement(keyDetailsView.clearSearchInput)
    }
  })
  it('Verify that user can add field to Hash', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'hashField11111'
    const keyValue = 'hashValue11111!'
    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: 'field',
          value: 'value',
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
    // Add field to the hash key
    await keyDetailsView.addFieldToHash(keyFieldValue, keyValue)
    // Search the added field
    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    let fieldValue = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    let value = await (
      await keyDetailsView.getElements(keyDetailsView.hashValuesList)
    )[0].getText()
    // Check the added field
    expect(fieldValue).contains(keyFieldValue, 'The field is not displayed')
    expect(value).contains(keyValue, 'The value is not displayed')
    await keyDetailsView.clearSearchInKeyDetails()

    // Verify that user can remove field from Hash
    await keyDetailsView.removeRowByField(KeyTypesShort.Hash, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.Hash,
      keyFieldValue,
    )
    await keyDetailsView.switchBack()
    // Check the notification message that field deleted
    await NotificationActions.checkNotificationMessage(
      `${keyFieldValue} has been removed from ${keyName}`,
    )

    await keyDetailsView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
    // Verify that hash key deleted when all fields deleted
    await keyDetailsView.removeRowByField(
      KeyTypesShort.Hash,
      hashKeyParameters.fields[0].field,
    )
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.Hash,
      hashKeyParameters.fields[0].field,
    )
    await keyDetailsView.switchBack()
    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for hash key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })

  it('Verify that tab is closed if Hash was deleted from keys list', async function () {
    keyName = Common.generateWord(10)

    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: 'field',
          value: 'value',
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

    await treeView.switchBack()
    const titles = await editorView.getOpenEditorTitles()
    const isTitleCorrect = titles.some((t: string) => t === `hash:${keyName}`)
    expect(isTitleCorrect).eql(true, 'tab name is unexpected')
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.deleteKeyFromListByName(keyName)
    await treeView.switchBack()
    // Verify that details panel is closed for hash key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })
})

import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import {
  WebView,
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
import { Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Hash Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: HashKeyDetailsView
  let treeView: TreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await DatabaseAPIRequests.deleteAllDatabasesApi()
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

    const commands = ['hashField*', '*11111', 'hash*11111']
    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await ButtonActions.clickElement(keyDetailsView.clearSearchInput)

    for (const c of commands) {
      await keyDetailsView.searchByTheValueInKeyDetails(c)
      // Check the search result
      let result = await (
        await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
      )[0].getText()
      expect(result).eqls(keyFieldValue)
      expect(result.length).eqls(1)
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
          value: 'value'
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
    await webView.switchBack()
    // Check the notification message that field deleted
    await NotificationActions.checkNotificationMessage(`${keyFieldValue} has been removed from ${keyName}`)

    await webView.switchToFrame(Views.KeyDetailsView)
    // Verify that hash key deleted when all fields deleted
    await keyDetailsView.removeRowByField(KeyTypesShort.Hash, hashKeyParameters.fields[0].field)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.Hash,
      hashKeyParameters.fields[0].field,
    )
    await webView.switchBack()
    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(`${keyName} has been deleted.`)

    // Verify that details panel is closed for hash key after deletion
    KeyDetailsActions.verifyDetailsPanelClosed()
  })
})

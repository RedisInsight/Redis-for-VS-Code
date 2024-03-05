import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import {
  WebView,
  TreeView,
  ListKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  DatabasesActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ListKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyActions } from '@e2eSrc/helpers/KeysActions'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

let keyName: string

describe('List Key verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let listKeyDetailsView: ListKeyDetailsView
  let treeView: TreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    listKeyDetailsView = new ListKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can search List element by index', async function () {
    keyName = Common.generateWord(10)
    const elements = [
      '1111listElement11111',
      '2222listElement22222',
      '33333listElement33333',
    ]
    const listKeyParameters: ListKeyParameters = {
      keyName: keyName,
      element: elements[0],
    }
    const keyToAddParameters = {
      fieldsCount: 1,
      keyName,
      fieldStartWith: elements[1],
    }

    const keyToAddParameters2 = {
      fieldsCount: 1,
      keyName,
      fieldStartWith: elements[2],
    }

    await KeyAPIRequests.addListKeyApi(
      listKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Add elements to the list key
    await KeyActions.populateZSetWithMembers(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters,
    )
    await KeyActions.populateZSetWithMembers(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters2,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    // Search List element by index
    await listKeyDetailsView.searchByTheValueInKeyDetails('1')

    // Check the search result
    let result = await (
      await listKeyDetailsView.getElements(listKeyDetailsView.elementsList)
    )[0].getText()
    expect(result).contains(elements[1])
    await listKeyDetailsView.clearSearchInKeyDetails()

    // Verify that list key deleted when all elements deleted
    await listKeyDetailsView.removeRowsByFieldValues(
      KeyTypesShort.List,
      elements,
    )
    await webView.switchBack()
    await NotificationActions.checkNotificationMessage(`${keyName} has been deleted.`)

    // Verify that details panel is closed for list key after deletion
     KeyDetailsActions.verifyDetailsPanelClosed()
  })
})

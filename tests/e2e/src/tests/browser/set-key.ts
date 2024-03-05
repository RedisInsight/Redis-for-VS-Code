import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser, Workbench } from 'vscode-extension-tester'
import {
  WebView,
  SetKeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonActions,
  DatabasesActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SetKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyActions } from '@e2eSrc/helpers/KeysActions'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Set Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: SetKeyDetailsView
  let treeView: TreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new SetKeyDetailsView()
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
  it('Verify that user can search and delete by member in Set', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'setField11111'
    const setKeyParameters: SetKeyParameters = {
      keyName: keyName,
      members: [keyFieldValue],
    }
    const keyToAddParameters = {
      fieldsCount: 1,
      keyName,
      fieldStartWith: 'setField',
    }

    await KeyAPIRequests.addSetKeyApi(
      setKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Add fields to the Set key
    await KeyActions.populateSetWithMembers(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.setFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await ButtonActions.clickElement(keyDetailsView.clearSearchInput)
    await ButtonActions.clickElement(keyDetailsView.refreshKeyButton)

    // Verify that user can remove member from Set
    await keyDetailsView.removeRowByField(KeyTypesShort.Set, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.Set,
      keyFieldValue,
    )
    await webView.switchBack()
    let notifications = await new Workbench().getNotifications()
    let notification = notifications[0]
    // get the message
    let message = await notification.getMessage()
    expect(message).eqls(`Member has been deleted`)

    await webView.switchToFrame(Views.KeyDetailsView)
    await keyDetailsView.removeFirstRow(KeyTypesShort.Set)
    await webView.switchBack()

    notifications = await new Workbench().getNotifications()
    notification = notifications[0]
    // get the message
    message = await notification.getMessage()
    expect(message).eqls(`${keyName} has been deleted.`)
  })
})

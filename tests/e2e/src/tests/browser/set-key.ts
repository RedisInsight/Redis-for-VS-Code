import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
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
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SetKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Set Key fields verification', () => {
  let webView: WebView
  let keyDetailsView: SetKeyDetailsView
  let treeView: TreeView

  before(async () => {
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
    await webView.switchToFrame(Views.TreeView)
  })
  after(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can search and delete by member in Set', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'setField11111'
    const setKeyParameters: SetKeyParameters = {
      keyName: keyName,
      members: ['setField'],
    }

    await KeyAPIRequests.addSetKeyApi(
      setKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
    // Verify that user can add member to Set
    await keyDetailsView.addMemberToSet(keyFieldValue)
    // Search the added member
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
    // Check the notification message that field deleted
    await NotificationActions.checkNotificationMessage(
      `${keyFieldValue} has been removed from ${keyName}`,
    )

    await webView.switchToFrame(Views.KeyDetailsView)
    await keyDetailsView.removeFirstRow(KeyTypesShort.Set)
    await webView.switchBack()

    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for set key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })
})

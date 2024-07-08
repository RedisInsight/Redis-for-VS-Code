import { expect } from 'chai'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Common } from '@e2eSrc/helpers/Common'
import { Config } from '@e2eSrc/helpers/Conf'
import { StringKeyDetailsView, TreeView } from '@e2eSrc/page-objects/components'
import {
  DatabasesActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

describe('Actions with Key List', () => {
  let keyDetailsView: StringKeyDetailsView
  let treeView: TreeView

  before(async () => {
    keyDetailsView = new StringKeyDetailsView()
    treeView = new TreeView()

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
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  it('Verify that key deleted properly from the list', async function () {
    // Adding a string key
    const keyName = Common.generateWord(10)
    const keyValue = Common.generateWord(10)
    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: keyName,
        value: keyValue,
      },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )

    let actualItemsArray = await treeView.getAllKeysArray()
    expect(actualItemsArray).contains(keyName, 'Key added properly')
    await treeView.deleteKeyFromListByName(keyName)
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      false,
      'The key was not deleted',
    )
    await treeView.switchBack()
    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )
  })

  it('Verify that key deleted properly from details', async function () {
    const keyName = Common.generateWord(10)
    const keyValue = Common.generateWord(10)
    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: keyName,
        value: keyValue,
      },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    // Delete key from detailed view
    await keyDetailsView.removeKeyFromDetailedView()
    await keyDetailsView.switchBack()
    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for zset key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })
})

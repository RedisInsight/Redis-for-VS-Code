import { expect } from 'chai'
import { describe, it } from 'mocha'
import {
  ActivityBar,
  VSBrowser,
  beforeEach,
  afterEach,
  before,
  after
} from 'vscode-extension-tester'
import {
  TreeView,
  KeyDetailsView,
  AddDatabaseView,
} from '@e2eSrc/page-objects/components'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  ButtonActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

describe('Connecting to the databases verifications', () => {
  let browser: VSBrowser
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView
  let addDatabaseView: AddDatabaseView

  before(async () => {
    browser = VSBrowser.instance
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()
    addDatabaseView = new AddDatabaseView()

    await browser.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('Redis for VS Code'))?.openView()
  })
  beforeEach(async () => {
    await ButtonActions.clickElement(treeView.addDatabaseBtn)
    await treeView.switchBack()
    await addDatabaseView.switchToInnerViewFrame(
      InnerViews.AddDatabaseInnerView,
    )
  })
  afterEach(async () => {
    await addDatabaseView.switchBack()
  })

  it('Verify that user can see error message if he can not connect to added Database', async function () {
    const errorMessage = `Could not connect to ${Config.invalidOssStandaloneConfig.host}:${Config.invalidOssStandaloneConfig.port}, please check the connection details.`

    // Fill the add database form
    await addDatabaseView.addRedisDataBase(Config.invalidOssStandaloneConfig)

    // TODO when Test Connection button will be implemented
    // Verify that when user request to test database connection is not successfull, can see standart connection error

    // Click for saving
    await ButtonActions.clickElement(addDatabaseView.saveDatabaseButton)

    await addDatabaseView.switchBack()
    // Check the notification message
    await NotificationActions.checkNotificationMessage(errorMessage)
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    // Verify that the database is not in the list
    expect(
      await addDatabaseView.isElementDisplayed(
        treeView.getDatabaseByName(
          Config.invalidOssStandaloneConfig.databaseName,
        ),
      ),
    ).eql(false, 'Invalid database is displayed')
  })
})

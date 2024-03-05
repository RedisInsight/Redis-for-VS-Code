import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import {
  WebView,
  TreeView,
  KeyDetailsView,
  DatabaseDetailsView,
  AddDatabaseView,
} from '@e2eSrc/page-objects/components'
import { Config } from '@e2eSrc/helpers/Conf'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { ButtonActions, NotificationActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers'

describe('Connecting to the databases verifications', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView
  let databaseDetailsView: DatabaseDetailsView
  let addDatabaseView: AddDatabaseView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()
    databaseDetailsView = new DatabaseDetailsView()
    addDatabaseView = new AddDatabaseView()

    await browser.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await ButtonActions.clickElement(treeView.addDatabaseBtn)
    await webView.switchBack()
    await webView.switchToFrame(Views.DatabaseDetailsView)
  })
  afterEach(async () => {
    await webView.switchBack()
  })
  it('Verify that user can see error message if he can not connect to added Database', async function () {
    const errorMessage = `Could not connect to ${Config.invalidOssStandaloneConfig.host}:${Config.invalidOssStandaloneConfig.port}, please check the connection details.`

    // Fill the add database form
    await addDatabaseView.addRedisDataBase(Config.invalidOssStandaloneConfig)

    // TODO when Test Connection button will be implemented
    // Verify that when user request to test database connection is not successfull, can see standart connection error

    // Click for saving
    await ButtonActions.clickElement(databaseDetailsView.saveDatabaseButton)

    await new WebView().switchBack()
    // Check the notification message
    await CommonDriverExtension.driverSleep(2000)
    await NotificationActions.checkNotificationMessage(errorMessage)
    await webView.switchToFrame(Views.TreeView)
    // Verify that the database is not in the list
    expect(
      await databaseDetailsView.isElementDisplayed(
        treeView.getDatabaseByName(
          Config.invalidOssStandaloneConfig.databaseName,
        ),
      ),
    ).false
  })
})

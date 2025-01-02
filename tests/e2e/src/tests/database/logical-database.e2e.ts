import { expect } from 'chai'
import { describe, it } from 'mocha'
import { beforeEach, after, afterEach } from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { TreeView, CliViewPanel, ListKeyDetailsView } from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  DatabasesActions,
} from '@e2eSrc/helpers/common-actions'
import { Common, CommonDriverExtension, Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api';

describe('Logical Databases', () => {
  let treeView: TreeView
  let cliViewPanel: CliViewPanel
  let listKeyDetailsView: ListKeyDetailsView

  const keyName1 = Common.generateString(10)
  const keyName2 = Common.generateString(10)

  beforeEach(async () => {
    cliViewPanel = new CliViewPanel()
    treeView = new TreeView()
    listKeyDetailsView = new ListKeyDetailsView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )

    await treeView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.openCliByDatabaseName(
      Config.ossStandaloneConfig.databaseName,
    )
    await treeView.switchBack()
    await CommonDriverExtension.driverSleep(1000)
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)
    await cliViewPanel.executeCommand('clear')

  })
  afterEach(async () => {
    await treeView.switchBack()
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)
    await cliViewPanel.executeCommand('flushdb')
    await treeView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  it('Verify that user see logical db', async function () {
    await treeView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)

    expect(
      await treeView.isElementDisplayed(
        treeView.getIndexedDataBaseSummary(0),
      ),
    ).eql(true, 'Indexed base is not displayed')

    await treeView.switchBack()
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)
    await cliViewPanel.executeCommand(`SET ${keyName1} test1`)
    await cliViewPanel.executeCommand('SELECT 2')
    await cliViewPanel.executeCommand(`SET ${keyName2} test2`)
    await cliViewPanel.switchBack()

    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.refreshNotIndexedDatabaseByName(Config.ossStandaloneConfig.databaseName)
    expect(
      await treeView.isElementDisplayed(
        treeView.getIndexedDataBaseSummary(2),
      ),
    ).eql(true, 'Indexed base is not displayed')

    await treeView.clickOnIndexedDb(2)

    expect(await treeView.isKeyIsDisplayedInTheList(keyName1)).eql(
      false,
      'The key was found',
    )
    await CommonDriverExtension.driverSleep(2000)

    expect(await treeView.isKeyIsDisplayedInTheList(keyName2)).eql(
      true,
      'The key was not found',
    )

    await ButtonActions.clickElement(treeView.getIndexedDataBaseSummary(2))
    await treeView.clickOnIndexedDb(0)

    expect(await treeView.isKeyIsDisplayedInTheList(keyName1)).eql(
      true,
      'The key was not found',
    )
    expect(await treeView.isKeyIsDisplayedInTheList(keyName2)).eql(
      false,
      'The key was not found',
    )

    await treeView.deleteFirstKeyFromList()
    await treeView.refreshNotIndexedDatabaseByName(Config.ossStandaloneConfig.databaseName)

    expect(
      await treeView.isElementDisplayed(
        treeView.getIndexedDataBaseSummary(0),
      ),
    ).eql(false, 'Indexed base is displayed after removing the keys')
  })
})

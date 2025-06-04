import { describe, it } from 'mocha'
import { before, after } from 'vscode-extension-tester'
import { SettingsView, TreeView } from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  DatabasesActions,
  TreeViewActions,
} from '@e2eSrc/helpers/common-actions'
import { Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

describe('Delimiter tests', () => {
  let treeView: TreeView
  let settingsView: SettingsView
  const keyNames = [
    `device:common-dev`,
    `device-common:dev`,
    `device:common:dev`,
    `device-common-dev`,
    `device:common-stage`,
    `device:common1-stage`,
    `mobile:common-dev`,
    `mobile:common-stage`,
  ]

  before(async () => {
    treeView = new TreeView()
    settingsView = new SettingsView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  beforeEach(async () => {
    for (const key of keyNames) {
      await treeView.switchBack()
      await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
      await KeyAPIRequests.addHashKeyApi(
        {
          keyName: key,
          fields: [
            {
              field: 'field',
              value: 'value',
            },
          ],
        },
        Config.ossStandaloneConfig.databaseName,
      )
    }
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
  })
  afterEach(async () => {
    await treeView.switchBack()
    for (const key of keyNames) {
      await KeyAPIRequests.deleteKeyIfExistsApi(
        key,
        Config.ossStandaloneConfig.databaseName,
      )
    }
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
  })
  after(async () => {
    await treeView.switchBack()
    // Go to Settings page
    await ButtonActions.clickElement(treeView.settingsButton)
    await settingsView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
    await settingsView.setDelimiterDefaultValue()
    await treeView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  it('Verify that user can set multiple delimiters in the tree view', async function () {
    // Verify folders ordering with default delimiter
    await TreeViewActions.checkTreeViewFoldersStructure(
      [['device', 'common'], ['device-common'], ['mobile']],
      [':'],
    )

    // Go to Settings page
    await settingsView.switchBack()
    await ButtonActions.clickElement(treeView.settingsButton)
    await settingsView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
    await settingsView.setDelimiterDefaultValue()

    // Apply new value to the field
    await settingsView.addDelimiterItem('-')
    // Verify that when user changes the delimiter and clicks on Save button delimiter is applied
    await settingsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await TreeViewActions.checkTreeViewFoldersStructure(
      [
        ['device', 'common'],
        ['device', 'common1'],
        ['mobile', 'common'],
      ],
      [':', '-'],
    )
  })
})

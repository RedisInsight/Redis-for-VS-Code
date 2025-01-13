import { expect } from 'chai'
import { describe, it } from 'mocha'
import {
  before,
  beforeEach,
  after,
  afterEach,
  EditorView,
} from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { TreeView, SettingsView } from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  CheckboxActions,
  DatabasesActions,
  InputActions,
  TreeViewActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers'

describe('Settings', () => {
  let treeView: TreeView
  let settingsView: SettingsView
  let editorView: EditorView

  before(async () => {
    treeView = new TreeView()
    settingsView = new SettingsView()
    editorView = new EditorView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
    await treeView.switchBack()
    // Go to Settings page
    await ButtonActions.clickElement(treeView.settingsButton)
    await settingsView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
    await settingsView.setDelimiterDefaultValue()
  })
  beforeEach(async () => {
    await treeView.switchBack()
    // Go to Settings page
    await ButtonActions.clickElement(treeView.settingsButton)
    await settingsView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
  })
  afterEach(async () => {
    await treeView.switchBack()
  })
  after(async () => {
    await settingsView.switchBack()
    await ButtonActions.clickElement(treeView.settingsButton)
    await settingsView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
    // Change delimiter
    await settingsView.setDelimiterDefaultValue()
    await settingsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  it('Verify that user can turn on/off Analytics in Settings in the application', async function () {
    const currentValue = await settingsView.getAnalyticsSwitcherValue()
    await CheckboxActions.toggleCheckbox(
      settingsView.switchAnalyticsOption,
      !currentValue,
    )
    expect(await settingsView.getAnalyticsSwitcherValue()).not.eql(
      currentValue,
      'Analytics not switched properly',
    )
    await settingsView.switchBack()
    await editorView.closeEditor('Redis for VS Code - Settings')
    await ButtonActions.clickElement(treeView.settingsButton)
    await settingsView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
    expect(await settingsView.getAnalyticsSwitcherValue()).not.eql(
      currentValue,
      'Analytics not switched properly',
    )
  })

  it('Verify that when user changes the delimiter and clicks on Save button delimiter is applied', async function () {
    // Check the default delimiter value
    expect(
      await settingsView.isElementDisplayed(
        settingsView.getDelimiterBadgeByTitle(':'),
      ),
    ).eql(true, 'Default delimiter not applied')
    // Apply new value to the field
    await ButtonActions.clickElement(settingsView.delimiterComboboxInput)
    await InputActions.slowType(settingsView.delimiterComboboxInput, 'test')
    // Click on Apply button without applying by 'Enter' or 'Space' key
    await ButtonActions.clickElement(settingsView.applyDelimiterButton)
    // Check the previous delimiter value
    expect(
      await settingsView.isElementDisplayed(
        settingsView.getDelimiterBadgeByTitle(':'),
      ),
    ).eql(true, 'Default delimiter not applied')
    // Verify that not confirmed by 'Enter' or 'Space' key delimiter not applied
    expect(
      await settingsView.isElementDisplayed(
        settingsView.getDelimiterBadgeByTitle('test'),
      ),
    ).eql(false, 'Not confirmed delimiter not applied')

    // Change delimiter
    await settingsView.changeDelimiterInTreeView('-')
    await settingsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    // Verify that when user changes the delimiter and clicks on Save button delimiter is applied
    await TreeViewActions.checkTreeViewFoldersStructure(
      [
        ['device_us', 'west'],
        ['mobile_eu', 'central'],
        ['mobile_us', 'east'],
        ['user_us', 'west'],
        ['device_eu', 'central'],
        ['user_eu', 'central'],
      ],
      ['-'],
    )
  })
})

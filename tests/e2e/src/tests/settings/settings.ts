import { expect } from 'chai'
import { EditorView, VSBrowser } from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import {
  WebView,
  TreeView,
  DatabaseDetailsView,
  KeyDetailsView,
  AddDatabaseView,
  EditDatabaseView,
  SettingsView,
  InputWithButtons,
} from '@e2eSrc/page-objects/components'
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
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView
  let databaseDetailsView: DatabaseDetailsView
  let addDatabaseView: AddDatabaseView
  let editDatabaseView: EditDatabaseView
  let settingsView: SettingsView
  let editorView: EditorView

  before(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()
    databaseDetailsView = new DatabaseDetailsView()
    addDatabaseView = new AddDatabaseView()
    editDatabaseView = new EditDatabaseView()
    settingsView = new SettingsView()
    editorView = new EditorView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
    await webView.switchBack()
    // Go to Settings page
    await ButtonActions.clickElement(treeView.settingsButton)
    await webView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
  })
  after(async () => {
    await webView.switchBack()
    await ButtonActions.clickElement(treeView.settingsButton)
    await webView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
    // Change delimiter
    await ButtonActions.clickElement(settingsView.delimiterInput)
    await InputActions.slowType(settingsView.delimiterInput, ':')
    await ButtonActions.clickElement(InputWithButtons.applyInput)
    await webView.switchBack()
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
    await webView.switchBack()
    await editorView.closeEditor('RedisInsight - Settings')
    await ButtonActions.clickElement(treeView.settingsButton)
    await webView.switchToInnerViewFrame(InnerViews.SettingsInnerView)
    expect(await settingsView.getAnalyticsSwitcherValue()).not.eql(
      currentValue,
      'Analytics not switched properly',
    )
  })
  it('Verify that when user changes the delimiter and clicks on Save button delimiter is applied', async function () {
    // Check the default delimiter value
    expect(await InputActions.getInputValue(settingsView.delimiterInput)).eql(
      ':',
      'Default delimiter not applied',
    )
    // Apply new value to the field
    await InputActions.typeText(settingsView.delimiterInput, 'test')
    // Click on Cancel button
    await ButtonActions.clickElement(InputWithButtons.cancelInput)
    // Check the previous delimiter value
    expect(await InputActions.getInputValue(settingsView.delimiterInput)).eql(
      ':',
      'Default delimiter not applied',
    )

    // Change delimiter
    await ButtonActions.clickElement(settingsView.delimiterInput)
    await InputActions.slowType(settingsView.delimiterInput, '-')
    await ButtonActions.clickElement(InputWithButtons.applyInput)
    // Verify that user can see that input is not saved when the Cancel button is clicked
    await webView.switchBack()
    await webView.switchToInnerViewFrame(InnerViews.KeyListInnerView)
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
      '-',
    )
  })
})

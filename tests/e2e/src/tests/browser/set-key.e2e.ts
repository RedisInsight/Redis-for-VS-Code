import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import {
  AddSetKeyView,
  SetKeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SetKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Set Key fields verification', () => {
  let keyDetailsView: SetKeyDetailsView
  let treeView: TreeView
  let addSetKeyView: AddSetKeyView

  before(async () => {
    keyDetailsView = new SetKeyDetailsView()
    treeView = new TreeView()
    addSetKeyView = new AddSetKeyView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await keyDetailsView.switchBack()
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can search and delete by member in Set', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'setField11111'
    const setKeyParameters: SetKeyParameters = {
      keyName: keyName,
      members: ['setField'],
    }

    // Verify that user can add Set Key
    await addSetKeyView.addKey(setKeyParameters, KeyTypesShort.Set)
    await keyDetailsView.switchBack()
    // Check the notification message that key added
    await NotificationActions.checkNotificationMessage(
      `Key has been added`,
    )

    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)

    // Verify that user can add member to Set
    await keyDetailsView.addMemberToSet(keyFieldValue)
    // Search the added member
    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.setFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await keyDetailsView.clearSearchInKeyDetails()

    // Verify that user can remove member from Set
    await keyDetailsView.removeRowByField(KeyTypesShort.Set, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.Set,
      keyFieldValue,
    )
    await keyDetailsView.switchBack()
    // Check the notification message that field deleted
    await NotificationActions.checkNotificationMessage(
      `${keyFieldValue} has been removed from ${keyName}`,
    )

    await keyDetailsView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
    await keyDetailsView.removeFirstRow(KeyTypesShort.Set)
    await keyDetailsView.switchBack()

    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for set key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })

  it('Verify that add button is disabled in Set', async function () {
    keyName = Common.generateWord(10)

    await ButtonActions.clickElement(treeView.addKeyButton)
    await treeView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await addSetKeyView.selectKeyTypeByValue(KeyTypesShort.Set)

    expect(
      await addSetKeyView.isElementDisabled(addSetKeyView.addButton, 'class'),
    ).eql(true, 'add button is not disabled if name is not entered')

    await InputActions.typeText(addSetKeyView.keyNameInput, keyName)

    expect(
      await addSetKeyView.isElementDisabled(addSetKeyView.addButton, 'class'),
    ).eql(false, 'add button is disabled if name is entered')
  })
})

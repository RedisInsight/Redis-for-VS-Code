import { describe, it } from 'mocha'
import { AddListKeyView, ListKeyDetailsView, TreeView } from '@e2eSrc/page-objects/components'
import { after, afterEach, before, beforeEach } from 'vscode-extension-tester'
import { DatabasesActions, KeyDetailsActions, NotificationActions } from '@e2eSrc/helpers/common-actions'
import { Common, Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { expect } from 'chai'
import { AddElementInList, KeyTypesShort } from '@e2eSrc/helpers/constants'

describe('List Key multiple value verification', () => {
  let listKeyDetailsView: ListKeyDetailsView
  let treeView: TreeView
  let addListKeyView: AddListKeyView

  let keyName: string
  let keyName2: string
  const elements = [
    '0000listElement0000',
    '111111listElement111',
    '2222listElement22222',
    '33333listElement33333',
    '44444listElement44444'
  ]

  before(async () => {
    listKeyDetailsView = new ListKeyDetailsView()
    treeView = new TreeView()
    addListKeyView = new AddListKeyView()
    //await CommonDriverExtension.driverSleep(10000)
    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await listKeyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  beforeEach(async () => {
    keyName = Common.generateWord(10)
    keyName2 = Common.generateWord(10)
  })


  afterEach(async () => {
    await listKeyDetailsView.switchBack()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName2,
      Config.ossStandaloneConfig.databaseName,
    )
    await listKeyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  it('Verify that user can edit a multiple fields', async function () {
    const keyToAddParameters = {
      keyName,
      element: [elements[0]],
    }
    await KeyAPIRequests.addListKeyApi(
      keyToAddParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )

    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
    await listKeyDetailsView.addListElement([elements[1],elements[2]])

    expect(
      await listKeyDetailsView.getElementText(
         listKeyDetailsView.getElementValueByIndex(0),
        ),
    ).contains(elements[0])

    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.getElementValueByIndex(2),
      ),
    ).contains(elements[2])

    await listKeyDetailsView.addListElement([elements[3],elements[4]], AddElementInList.Head)

    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.getElementValueByIndex(4),
      ),
    ).contains(elements[2])

    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.getElementValueByIndex(0),
      ),
    ).contains(elements[4])
  })

  it('Verify that user can add a multiple fields', async function () {
    const keyToAddParameters = {
      keyName,
      element: [elements[0],elements[1],elements[2]],
    }

    const keyToAddParameters2 = {
      keyName: keyName2,
      element: [elements[0],elements[1],elements[2]],
      position: AddElementInList.Head
    }

    await addListKeyView.addKey(keyToAddParameters, KeyTypesShort.List)
    await addListKeyView.switchBack()
    await NotificationActions.checkNotificationMessage(`Key has been added`)
    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.getElementValueByIndex(0),
      ),
    ).contains(elements[0])

    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.getElementValueByIndex(2),
      ),
    ).contains(elements[2])

    await addListKeyView.switchBack()

    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await addListKeyView.addKey(keyToAddParameters2, KeyTypesShort.List)

    await addListKeyView.switchBack()

    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)

    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.getElementValueByIndex(0),
      ),
    ).contains(elements[2])

    expect(
      await listKeyDetailsView.getElementText(
        listKeyDetailsView.getElementValueByIndex(2),
      ),
    ).contains(elements[0])

  })
})

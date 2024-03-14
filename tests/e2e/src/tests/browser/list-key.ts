import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  WebView,
  TreeView,
  ListKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  DatabasesActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { ListKeyParameters } from '@e2eSrc/helpers/types/types'
import { Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string
const elements = [
  '1111listElement11111',
  '2222listElement22222',
  '33333listElement33333',
]

describe('List Key verification', () => {
  let webView: WebView
  let listKeyDetailsView: ListKeyDetailsView
  let treeView: TreeView

  before(async () => {
    webView = new WebView()
    listKeyDetailsView = new ListKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
    keyName = Common.generateWord(10)
    const listKeyParameters: ListKeyParameters = {
      keyName: keyName,
      element: elements[0],
    }
    const keyToAddParameters = {
      keyName,
      element: elements[1],
    }

    const keyToAddParameters2 = {
      keyName,
      element: elements[2],
    }

    await KeyAPIRequests.addListKeyApi(
      listKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Add elements to the list key
    await KeyAPIRequests.addElementsToListKeyApi(
      keyToAddParameters,
      Config.ossStandaloneConfig.databaseName,
      'TAIL',
    )
    await KeyAPIRequests.addElementsToListKeyApi(
      keyToAddParameters2,
      Config.ossStandaloneConfig.databaseName,
      'TAIL',
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await webView.switchToFrame(Views.TreeView)
  })
  after(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can search List element by index', async function () {
    // Search List element by index
    await listKeyDetailsView.searchByTheValueInKeyDetails('1')

    // Check the search result
    let result = await (
      await listKeyDetailsView.getElements(listKeyDetailsView.elementsList)
    )[0].getText()
    expect(result).contains(elements[1])
    await listKeyDetailsView.clearSearchInKeyDetails()
  })

  it('Verify that user can select remove List element position: from tail', async function () {
    // Remove element from the key
    await listKeyDetailsView.removeListElementFromTail('1')

    // Check the notification message
    await webView.switchBack()
    await NotificationActions.checkNotificationMessage(
      `1 Element(s) removed from ${keyName}`,
    )

    // Check the removed element is not in the list
    await webView.switchToFrame(Views.KeyDetailsView)
    expect(
      await listKeyDetailsView.isElementDisplayed(
        listKeyDetailsView.elementValueByText(elements[2]),
      ),
    ).eql(false, 'Removed element is still in the list')
  })

  it('Verify that user can select remove List element position: from head', async function () {
    // Remove element from the key
    await listKeyDetailsView.removeListElementFromHead('1')
    // Check the notification message
    await webView.switchBack()
    await NotificationActions.checkNotificationMessage(
      `1 Element(s) removed from ${keyName}`,
    )
    // Check the removed element is not in the list
    await webView.switchToFrame(Views.KeyDetailsView)
    expect(
      await listKeyDetailsView.isElementDisplayed(
        listKeyDetailsView.elementValueByText(elements[0]),
      ),
    ).eql(false, 'Removed element is still in the list')
  })

  it('Verify that user can remove list Key by removing all elements', async function () {
    // Remove all element from the key
    await listKeyDetailsView.removeListElementFromHead('3')
    await webView.switchBack()
    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for list key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })
})

describe('List Key verification for db with version <6.2', () => {
  let webView: WebView
  let listKeyDetailsView: ListKeyDetailsView
  let treeView: TreeView

  beforeEach(async () => {
    webView = new WebView()
    listKeyDetailsView = new ListKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneV5Config,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyIfExistsApi(
      keyName,
      Config.ossStandaloneV5Config.databaseName,
    )
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can remove only one element for List for Redis v. <6.2', async function () {
    keyName = Common.generateWord(10)
    const listKeyParameters: ListKeyParameters = {
      keyName: keyName,
      element: elements[0],
    }

    await KeyAPIRequests.addListKeyApi(
      listKeyParameters,
      Config.ossStandaloneV5Config.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneV5Config.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
    // Add a few elements to the List key
    await listKeyDetailsView.addListElementToTail(elements[1])
    // Verify that user can add element to List
    await listKeyDetailsView.getElement(
      listKeyDetailsView.elementValueByText(elements[1]),
    )
    expect(
      await listKeyDetailsView.isElementDisplayed(
        listKeyDetailsView.elementValueByText(elements[1]),
      ),
    ).eql(true, 'Element not added')

    await listKeyDetailsView.addListElementToHead(elements[2])
    await listKeyDetailsView.getElement(
      listKeyDetailsView.elementValueByText(elements[2]),
    )
    // Remove element from the key
    await listKeyDetailsView.removeListElementFromHeadOld()
    // Check the removed element is not in the list

    expect(
      await listKeyDetailsView.waitForElementVisibility(
        listKeyDetailsView.elementValueByText(elements[2]),
        3000,
        false,
      ),
    ).eql(true, 'Element not removed')
    // Check that only one element is removed
    expect(await listKeyDetailsView.getKeyLength()).eql(
      2,
      'Wrong number of elements removed',
    )
    // Check the notification message
    await webView.switchBack()
    await NotificationActions.checkNotificationMessage(
      `1 Element(s) removed from ${keyName}`,
    )
  })
})

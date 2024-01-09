import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  SortedSetKeyDetailsView,
  KeyTreeView,
  ListKeyDetailsView,
  HashKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonsActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  ListKeyParameters,
  HashKeyParameters,
  SortedSetKeyParameters,
} from '@e2eSrc/helpers/types/types'

let keyName: string

describe('Large key details verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let sortedsetKeyDetailsView: SortedSetKeyDetailsView
  let hashKeyDetailsView: HashKeyDetailsView
  let keyTreeView: KeyTreeView
  let listKeyDetailsView: ListKeyDetailsView

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    sortedsetKeyDetailsView = new SortedSetKeyDetailsView()
    hashKeyDetailsView = new HashKeyDetailsView()
    keyTreeView = new KeyTreeView()
    listKeyDetailsView = new ListKeyDetailsView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can expand/collapse for sorted set data type', async function () {
    keyName = Common.generateWord(20)

    const sortedSetKeyParameters: SortedSetKeyParameters = {
      keyName: keyName,
      members: [
        {
          name: 'wqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsa',
          score: 1,
        },
      ],
    }

    await KeyAPIRequests.addSortedSetKeyApi(
      sortedSetKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const memberValueCell = await sortedsetKeyDetailsView.getElement(
      sortedsetKeyDetailsView.sortedSetFieldsList,
    )
    const size = await memberValueCell.getRect()
    const rowHeight = size.height

    await ButtonsActions.clickAndWaitForElement(
      sortedsetKeyDetailsView.sortedSetFieldsList,
      sortedsetKeyDetailsView.truncatedValue,
      false,
    )

    let newSize = await memberValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonsActions.clickAndWaitForElement(
      sortedsetKeyDetailsView.sortedSetFieldsList,
      sortedsetKeyDetailsView.truncatedValue,
    )

    newSize = await memberValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })

  it('Verify that user can expand/collapse for hash data type', async function () {
    keyName = Common.generateWord(20)

    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: 'keyFieldValue',
          value:
            'keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue ',
        },
      ],
    }

    await KeyAPIRequests.addHashKeyApi(
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const memberValueCell = await hashKeyDetailsView.getElement(
      hashKeyDetailsView.hashValuesList,
    )
    const size = await memberValueCell.getRect()
    const rowHeight = size.height

    await ButtonsActions.clickAndWaitForElement(
      hashKeyDetailsView.hashValuesList,
      hashKeyDetailsView.truncatedValue,
      false,
    )

    let newSize = await memberValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonsActions.clickAndWaitForElement(
      hashKeyDetailsView.hashValuesList,
      hashKeyDetailsView.truncatedValue,
    )

    newSize = await memberValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })
  it('Verify that user can expand/collapse for list data type', async function () {
    keyName = Common.generateWord(20)

    const listKeyParameters: ListKeyParameters = {
      keyName: keyName,
      element:
        'wqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsa',
    }

    await KeyAPIRequests.addListKeyApi(
      listKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const elementValueCell = await listKeyDetailsView.getElement(
      listKeyDetailsView.elementsList,
    )
    const size = await elementValueCell.getRect()
    const rowHeight = size.height

    await ButtonsActions.clickAndWaitForElement(
      listKeyDetailsView.elementsList,
      listKeyDetailsView.truncatedValue,
      false,
    )
    // Verify that user can expand a row of list data type
    let newSize = await elementValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonsActions.clickAndWaitForElement(
      listKeyDetailsView.elementsList,
      listKeyDetailsView.truncatedValue,
    )
    // Verify that user can collapse a row of list data type
    newSize = await elementValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })
})

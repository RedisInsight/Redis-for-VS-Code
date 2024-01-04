import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  SortedSetKeyDetailsView,
  KeyTreeView,
  CliViewPanel,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SortedSetKeyParameters } from '@e2eSrc/helpers/types/types'
import { Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Large key details verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let keyDetailsView: SortedSetKeyDetailsView
  let keyTreeView: KeyTreeView
  let sideBarView: SideBarView | undefined
  let cliViewPanel: CliViewPanel

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new SortedSetKeyDetailsView()
    keyTreeView = new KeyTreeView()

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
    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(Views.KeyTreeView)
    await keyTreeView.openKeyDetailsByKeyName(keyName)
    await webView.switchBack()

    await webView.switchToFrame(Views.KeyDetailsView)

    const memberValueCell = await keyDetailsView.getElement(
      keyDetailsView.sortedSetFieldsList,
    )
    const size = await memberValueCell.getRect()
    const rowHeight = size.height

    await ButtonsActions.clickAndWaitForElement(
      keyDetailsView.sortedSetFieldsList,
      keyDetailsView.truncatedValue,
      false,
    )

    let newSize = await memberValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonsActions.clickAndWaitForElement(
      keyDetailsView.sortedSetFieldsList,
      keyDetailsView.truncatedValue,
    )

    newSize = await memberValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })
})

import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  ActivityBar,
  SideBarView,
  VSBrowser,
  Workbench,
} from 'vscode-extension-tester'
import {
  BottomBar,
  WebView,
  HashKeyDetailsView,
  KeyTreeView,
  SortedSetKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  HashKeyParameters,
  SortedSetKeyParameters,
} from '@e2eSrc/helpers/types/types'
import { Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

const keyValueBefore = 'ValueBeforeEdit!'
const keyValueAfter = 'ValueAfterEdit!'

describe('Edit Key values verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let bottomBar: BottomBar
  let keyDetailsView: HashKeyDetailsView
  let keyTreeView: KeyTreeView
  let sideBarView: SideBarView | undefined
  let workbeanch: Workbench
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new HashKeyDetailsView()
    keyTreeView = new KeyTreeView()
    workbeanch = new Workbench()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can edit Hash Key field', async function () {
    const fieldName = 'test'
    keyName = Common.generateWord(10)

    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: fieldName,
          value: keyValueBefore,
        },
      ],
    }
    await KeyAPIRequests.addHashKeyApi(
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    sideBarView = await (
      await new ActivityBar().getViewControl('RedisInsight')
    )?.openView()

    await webView.switchToFrame(Views.KeyTreeView)
    await keyTreeView.openKeyDetailsByKeyName(keyName)
    await webView.switchBack()

    await webView.switchToFrame(Views.KeyDetailsView)
    await keyDetailsView.editHashKeyValue(keyValueAfter, fieldName)
    let resultValue = await (
      await keyDetailsView.getElements(keyDetailsView.hashValuesList)
    )[0].getText()
    expect(resultValue).eqls(keyValueAfter)
  })

  it('Verify that user can edit Sorted Set Key field', async function () {
    keyName = Common.generateWord(10)
    const scoreBefore = 5
    const scoreAfter = '10'
    const sortedSetKeyParameters: SortedSetKeyParameters = {
      keyName: keyName,
      members: [
        {
          name: keyValueBefore,
          score: scoreBefore,
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
    // await CommonDriverExtension.driverSleep()
    await sortedSetKeyDetailsView.editSortedSetKeyValue(
      scoreAfter,
      keyValueBefore,
    )
    let resultValue = await (
      await keyDetailsView.getElements(
        sortedSetKeyDetailsView.scoreSortedSetFieldsList,
      )
    )[0].getText()
    expect(resultValue).eqls(scoreAfter)
  })
})

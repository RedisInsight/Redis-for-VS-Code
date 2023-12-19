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
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'

let KeyName: string

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

  beforeEach(async () => {
    browser = VSBrowser.instance
    bottomBar = new BottomBar()
    webView = new WebView()
    keyDetailsView = new HashKeyDetailsView()
    keyTreeView = new KeyTreeView()
    workbeanch = new Workbench()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      KeyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can edit Hash Key field', async function () {
    const fieldName = 'test'
    KeyName = Common.generateWord(10)

    const hashKeyParameters: HashKeyParameters = {
      keyName: KeyName,
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

    await webView.switchToFrame(KeyTreeView.treeFrame)
    await keyTreeView.openKeyDetailsByKeyName(KeyName)
    await webView.switchBack()

    await webView.switchToFrame(HashKeyDetailsView.keyFrame)
    await keyDetailsView.editHashKeyValue(keyValueAfter, fieldName)
    let resultValue = await (
      await keyDetailsView.getElements(keyDetailsView.hashValuesList)
    )[0].getText()
    expect(resultValue).eqls(keyValueAfter)
  })
})

import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  ActivityBar,
  VSBrowser,
  Workbench,
} from 'vscode-extension-tester'
import {
  WebView,
  HashKeyDetailsView,
  KeyTreeView,
  SortedSetKeyDetailsView,
  ListKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  HashKeyParameters,
  ListKeyParameters,
  SortedSetKeyParameters,
} from '@e2eSrc/helpers/types/types'
import { KeyDetailsActions } from '@e2eSrc/helpers/common-actions'

let keyName: string

const keyValueBefore = 'ValueBeforeEdit!'
const keyValueAfter = 'ValueAfterEdit!'

describe('Edit Key values verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let hashKeyDetailsView: HashKeyDetailsView
  let keyTreeView: KeyTreeView
  let workbeanch: Workbench
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView
  let listKeyDetailsView: ListKeyDetailsView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    hashKeyDetailsView = new HashKeyDetailsView()
    keyTreeView = new KeyTreeView()
    workbeanch = new Workbench()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()
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
    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await hashKeyDetailsView.editHashKeyValue(keyValueAfter, fieldName)
    let resultValue = await (
      await hashKeyDetailsView.getElements(hashKeyDetailsView.hashValuesList)
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
    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await sortedSetKeyDetailsView.editSortedSetKeyValue(
      scoreAfter,
      keyValueBefore,
    )
    let resultValue = await (
      await sortedSetKeyDetailsView.getElements(
        sortedSetKeyDetailsView.scoreSortedSetFieldsList,
      )
    )[0].getText()
    expect(resultValue).eqls(scoreAfter)
  })
  it('Verify that user can edit List Key element', async function () {
    keyName = Common.generateWord(10)

    const listKeyParameters: ListKeyParameters = {
      keyName: keyName,
      element: keyValueBefore,
    }
    await KeyAPIRequests.addListKeyApi(
      listKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await listKeyDetailsView.editListKeyValue(keyValueAfter, '0')
    let resultValue = await (
      await listKeyDetailsView.getElements(listKeyDetailsView.elementsList)
    )[0].getText()
    expect(resultValue).eqls(keyValueAfter)
  })
})

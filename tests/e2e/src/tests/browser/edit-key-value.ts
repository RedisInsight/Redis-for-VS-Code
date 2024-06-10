import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import {
  HashKeyDetailsView,
  TreeView,
  SortedSetKeyDetailsView,
  ListKeyDetailsView,
  StringKeyDetailsView,
  KeyDetailsView,
  AddStringKeyView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  HashKeyParameters,
  ListKeyParameters,
  SortedSetKeyParameters,
} from '@e2eSrc/helpers/types/types'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

let keyName: string
const keyValueBefore = 'ValueBeforeEdit!'
const keyValueAfter = 'ValueAfterEdit!'

describe('Edit Key values verification', () => {
  let hashKeyDetailsView: HashKeyDetailsView
  let treeView: TreeView
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView
  let listKeyDetailsView: ListKeyDetailsView
  let stringKeyDetailsView: StringKeyDetailsView
  let keyDetailsView: KeyDetailsView
  let addStringKeyView: AddStringKeyView

  before(async () => {
    hashKeyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()
    listKeyDetailsView = new ListKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()
    keyDetailsView = new KeyDetailsView()
    addStringKeyView = new AddStringKeyView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await keyDetailsView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
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
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await hashKeyDetailsView.editHashKeyValue(keyValueAfter, fieldName)
    let resultValue = await (
      await hashKeyDetailsView.getElements(hashKeyDetailsView.hashValuesList)
    )[0].getText()
    expect(resultValue).eqls(keyValueAfter)
  })
  it('Verify that user can edit Zset Key member', async function () {
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
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
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
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await listKeyDetailsView.editListKeyValue(keyValueAfter, '0')
    let resultValue = await (
      await listKeyDetailsView.getElements(listKeyDetailsView.elementsList)
    )[0].getText()
    expect(resultValue).eqls(keyValueAfter)
  })
  it('Verify that user can edit String value', async function () {
    keyName = Common.generateWord(10)

    // Verify that user can add String Key
    await addStringKeyView.addStringKey(
      keyName,
      keyValueBefore,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    // Check the key value before edit
    let keyValue = await stringKeyDetailsView.getStringKeyValue()
    expect(keyValue).contains(keyValueBefore, 'The String value is incorrect')

    // Edit String key value
    await ButtonActions.clickElement(stringKeyDetailsView.stringKeyValueInput)
    await InputActions.typeText(
      stringKeyDetailsView.stringKeyValueInput,
      keyValueAfter,
    )

    // Verify that refresh is disabled for String key when editing value
    expect(
      await stringKeyDetailsView.isElementDisabled(
        stringKeyDetailsView.refreshKeyButton,
        'class',
      ),
    ).eql(true, 'Refresh button not disabled')

    await ButtonActions.clickElement(stringKeyDetailsView.applyBtn)
    // Check the key value after edit
    keyValue = await stringKeyDetailsView.getStringKeyValue()
    expect(keyValue).contains(keyValueAfter, 'Edited String value is incorrect')
  })
})

import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import {
  HashKeyDetailsView,
  TreeView,
  SortedSetKeyDetailsView,
  ListKeyDetailsView,
  StringKeyDetailsView,
  SetKeyDetailsView,
  InputWithButtons,
  KeyDetailsView,
  JsonKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  JsonKeyParameters,
  ListKeyParameters,
  SetKeyParameters,
  SortedSetKeyParameters,
  StringKeyParameters,
} from '@e2eSrc/helpers/types/types'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

let keyNameBefore = Common.generateWord(10)
let keyNameAfter = Common.generateWord(10)

describe('Edit Key names verification', () => {
  let hashKeyDetailsView: HashKeyDetailsView
  let treeView: TreeView
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView
  let listKeyDetailsView: ListKeyDetailsView
  let stringKeyDetailsView: StringKeyDetailsView
  let setKeyDetailsView: SetKeyDetailsView
  let jsonKeyDetailsView: JsonKeyDetailsView
  let keyDetailsView: KeyDetailsView

  before(async () => {
    hashKeyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()
    listKeyDetailsView = new ListKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()
    setKeyDetailsView = new SetKeyDetailsView()
    jsonKeyDetailsView = new JsonKeyDetailsView()
    keyDetailsView = new KeyDetailsView()

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
      keyNameAfter,
      Config.ossStandaloneConfig.databaseName,
    )
    await KeyAPIRequests.deleteKeyByNameApi(
      keyNameBefore,
      Config.ossStandaloneConfig.databaseName,
    )
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  it.only('Verify that user can edit String Key name', async function () {
    keyNameBefore = Common.generateWord(10)
    keyNameAfter = Common.generateWord(10)
    const stringKeyParameters: StringKeyParameters = {
      keyName: keyNameBefore,
      value: 'Value',
    }
    await KeyAPIRequests.addStringKeyApi(
      stringKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyNameBefore)
    let keyNameFromDetails = await InputActions.getInputValue(
      stringKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameBefore,
      'The String Key Name not correct before editing',
    )

    // Verify that user can cancel editing key name
    await ButtonActions.clickElement(stringKeyDetailsView.keyNameInput)
    await InputActions.slowType(
      stringKeyDetailsView.keyNameInput,
      'textToCancel',
    )
    await ButtonActions.clickElement(InputWithButtons.cancelInput)
    expect(keyNameFromDetails).eql(
      keyNameBefore,
      'The String Key Name not editing not canceled',
    )

    await stringKeyDetailsView.editKeyName(keyNameAfter)
    keyNameFromDetails = await InputActions.getInputValue(
      stringKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameAfter,
      'The String Key Name not correct after editing',
    )
  })
  it('Verify that user can edit Set Key name', async function () {
    keyNameBefore = Common.generateWord(10)
    keyNameAfter = Common.generateWord(10)
    const setKeyParameters: SetKeyParameters = {
      keyName: keyNameBefore,
      members: ['setField'],
    }

    await KeyAPIRequests.addSetKeyApi(
      setKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyNameBefore)
    let keyNameFromDetails = await InputActions.getInputValue(
      setKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameBefore,
      'The Set Key Name not correct before editing',
    )

    await setKeyDetailsView.editKeyName(keyNameAfter)
    keyNameFromDetails = await InputActions.getInputValue(
      setKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameAfter,
      'The Set Key Name not correct after editing',
    )
  })
  it('Verify that user can edit Zset Key name', async function () {
    keyNameBefore = Common.generateWord(10)
    keyNameAfter = Common.generateWord(10)
    const sortedSetKeyParameters: SortedSetKeyParameters = {
      keyName: keyNameBefore,
      members: [
        {
          name: 'keyValue',
          score: 1,
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
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyNameBefore)
    let keyNameFromDetails = await InputActions.getInputValue(
      sortedSetKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameBefore,
      'The Zset Key Name not correct before editing',
    )

    await sortedSetKeyDetailsView.editKeyName(keyNameAfter)
    keyNameFromDetails = await InputActions.getInputValue(
      sortedSetKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameAfter,
      'The Zset Key Name not correct after editing',
    )
  })
  it('Verify that user can edit Hash Key name', async function () {
    keyNameBefore = Common.generateWord(10)
    keyNameAfter = Common.generateWord(10)

    await KeyAPIRequests.addKeyApi(
      { keyName: keyNameBefore, keyType: KeyTypesShort.Hash },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyNameBefore)
    let keyNameFromDetails = await InputActions.getInputValue(
      hashKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameBefore,
      'The Hash Key Name not correct before editing',
    )

    await hashKeyDetailsView.editKeyName(keyNameAfter)
    keyNameFromDetails = await InputActions.getInputValue(
      hashKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameAfter,
      'The Hash Key Name not correct after editing',
    )
  })
  it('Verify that user can edit List Key name', async function () {
    keyNameBefore = Common.generateWord(10)
    keyNameAfter = Common.generateWord(10)
    const listKeyParameters: ListKeyParameters = {
      keyName: keyNameBefore,
      element: 'keyElementValue',
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
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyNameBefore)
    let keyNameFromDetails = await InputActions.getInputValue(
      listKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameBefore,
      'The List Key Name not correct before editing',
    )

    await listKeyDetailsView.editKeyName(keyNameAfter)
    keyNameFromDetails = await InputActions.getInputValue(
      listKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameAfter,
      'The List Key Name not correct after editing',
    )
  })
  it('Verify that user can edit JSON Key name', async function () {
    keyNameBefore = Common.generateWord(10)
    keyNameAfter = Common.generateWord(10)
    const jsonKeyParameters: JsonKeyParameters = {
      keyName: keyNameBefore,
      data: '{"name":"xyz"}',
    }
    await KeyAPIRequests.addJsonKeyApi(
      jsonKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyNameBefore)
    let keyNameFromDetails = await InputActions.getInputValue(
      jsonKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameBefore,
      'The JSON Key Name not correct before editing',
    )

    await jsonKeyDetailsView.editKeyName(keyNameAfter)
    keyNameFromDetails = await InputActions.getInputValue(
      jsonKeyDetailsView.keyNameInput,
    )
    expect(keyNameFromDetails).eql(
      keyNameAfter,
      'The JSON Key Name not correct after editing',
    )
  })
})

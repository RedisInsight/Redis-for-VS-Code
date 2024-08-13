import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, after, afterEach } from 'vscode-extension-tester'
import {
  AddHashKeyView,
  HashKeyDetailsView,
  KeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import {
  InputActions,
  ButtonActions,
  KeyDetailsActions,
  DatabasesActions,
} from '@e2eSrc/helpers/common-actions'
import { Common } from '@e2eSrc/helpers/Common'
import { CommonDriverExtension, Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { HashKeyParameters, SetKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

describe('Set TTL for Key', () => {

  const keyTTL = '2147476121'

  let keyDetailsView: KeyDetailsView
  let treeView: TreeView
  let keyName: string
  let addHashKeyView: AddHashKeyView
  let hashKeyDetailsView: HashKeyDetailsView

  before(async () => {
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()
    addHashKeyView = new AddHashKeyView()
    hashKeyDetailsView = new HashKeyDetailsView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneV7Config,
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneV7Config.databaseName,
    )
  })

  it('Verify that user can specify TTL for Key', async function () {
    keyName = Common.generateWord(20)
    const setKeyParameters: SetKeyParameters = {
      keyName,
      members: ['a'],
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
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
    await InputActions.slowType(keyDetailsView.editTtlInput, keyTTL)
    await ButtonActions.clickElement(keyDetailsView.applyTtlInputBtn)
    await CommonDriverExtension.driverSleep(1000)
    await ButtonActions.clickElement(keyDetailsView.refreshKeyButton)
    await CommonDriverExtension.driverSleep(1000)
    const newTtlValue = Number(
      await InputActions.getInputValue(keyDetailsView.editTtlInput),
    )
    expect(Number(keyTTL)).gt(newTtlValue)
  })

  it.only('Verify that user can set ttl for Hash fields', async function () {
    keyName = Common.generateWord(20)
    const field1 = 'Field1WithTtl'
    const field2 = 'Field2WithTtl'

    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: field1,
          value: field1,
          ttl: keyTTL
        },
        {
          field: field2,
          value: field2
        },
      ],
    }

    await addHashKeyView.addKey(hashKeyParameters, KeyTypesShort.Hash)
    await CommonDriverExtension.driverSleep(1000)
    await keyDetailsView.switchBack()

    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)

    //verify that user can create key with ttl for the has field
    const result = await hashKeyDetailsView.getElementText(
      hashKeyDetailsView.getFieldTtlInputByField(field1),
    )
    expect(Number(result)).lessThan(Number(keyTTL))

    // verify that ttl can have empty value
    await hashKeyDetailsView.editHashKeyTtl(field1, ' ')
    const result2 = await hashKeyDetailsView.getElementText(
      hashKeyDetailsView.getFieldTtlInputByField(field1),
    )
    expect(result2).eql('No Limit', 'the field ttl can not be removed')

    //verify that ttl field value can be set
    await hashKeyDetailsView.editHashKeyTtl(field2, keyTTL)
    const result3 = await hashKeyDetailsView.getElementText(
      hashKeyDetailsView.getFieldTtlInputByField(field2),
    )
    expect(result3).eql(result3, 'the field ttl can not be removed')

    //verify that ttl column can be hidden
    await ButtonActions.clickElement(hashKeyDetailsView.showTtlCheckbox)
    expect(await hashKeyDetailsView.isElementDisplayed(hashKeyDetailsView.getFieldTtlInputByField(field2))).eql(
      false,
      'ttl is displayed',
    )
    await ButtonActions.clickElement(hashKeyDetailsView.showTtlCheckbox)

    //verify that field is removed after ttl field is expired
    await hashKeyDetailsView.editHashKeyTtl(field2, '1')
    await ButtonActions.clickElement(hashKeyDetailsView.refreshKeyButton)
    await CommonDriverExtension.driverSleep(300)
    const fieldCount = (await (
      keyDetailsView.getElements(hashKeyDetailsView.hashFieldsList)
    )).length
    expect(fieldCount).eql(1, 'field is not removed')

    //verify that the key is removed if key has 1 field and ttl field is expired
    await hashKeyDetailsView.editHashKeyTtl(field1, '1')
    await CommonDriverExtension.driverSleep(300)
    await keyDetailsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await ButtonActions.clickElement(treeView.refreshButton)

    expect(await treeView.isElementDisplayed(treeView.getKeySelectorByName(keyName))).eql(
      false,
      'key is displayed',
    )
  })
})

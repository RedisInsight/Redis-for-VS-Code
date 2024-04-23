import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import { TreeView, HashKeyDetailsView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyActions } from '@e2eSrc/helpers/common-actions/KeyActions'
import {
  DatabasesActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Cases with large data', () => {
  let hashKeyDetailsView: HashKeyDetailsView
  let treeView: TreeView

  before(async () => {
    hashKeyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  afterEach(async () => {
    await hashKeyDetailsView.switchBack()
    await hashKeyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  after(async () => {
    await hashKeyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can search per exact field name in Hash in DB with 1 million of fields', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'field'
    const keyValue = 'value!'
    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: keyFieldValue,
          value: keyValue,
        },
      ],
    }
    const keyToAddParameters = {
      fieldsCount: 20000,
      KeyName: keyName,
      fieldStartWith: 'hashField',
      fieldValueStartWith: 'hashValue',
    }

    const keyToAddParameters2 = {
      fieldsCount: 1,
      KeyName: keyName,
      fieldStartWith: 'hastToSearch',
      fieldValueStartWith: 'hashValue',
    }

    await KeyAPIRequests.addHashKeyApi(
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )

    // Add 20000 fields to the hash key
    await KeyActions.populateHashWithFields(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters,
    )

    // Add 1 fields to the hash key
    await KeyActions.populateHashWithFields(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters2,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await hashKeyDetailsView.searchByTheValueInKeyDetails(
      keyToAddParameters2.fieldStartWith + '*',
    )
    // Check the search result
    let result = await (
      await hashKeyDetailsView.getElements(hashKeyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).contains(keyToAddParameters2.fieldStartWith)
  })
})

import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { VSBrowser } from 'vscode-extension-tester'
import {
  WebView,
  TreeView,
  StringKeyDetailsView,
  HashKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { KeyActions, StringKeyParameters } from '@e2eSrc/helpers/KeysActions'
import {
  ButtonActions,
  DatabasesActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'

let keyName: string

describe('Cases with large data', () => {
  let browser: VSBrowser
  let webView: WebView
  let stringKeyDetailsView: StringKeyDetailsView
  let hashKeyDetailsView: HashKeyDetailsView
  let treeView: TreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    stringKeyDetailsView = new StringKeyDetailsView()
    hashKeyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can download String key value as txt file when it has > 5000 characters', async function () {
    keyName = Common.generateWord(10)
    const bigKeyName = Common.generateWord(10)
    // Create string key with 5000 characters
    const length = 5000
    const keyValue = Common.generateWord(length)
    const stringKeyParameters: StringKeyParameters = {
      keyName: keyName,
      value: keyValue,
    }
    const bigStringKeyParameters: StringKeyParameters = {
      keyName: bigKeyName,
      value: keyValue + 1,
    }

    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: stringKeyParameters.keyName,
        value: stringKeyParameters.value,
      },
      Config.ossStandaloneConfig.databaseName,
    )

    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: bigStringKeyParameters.keyName,
        value: bigStringKeyParameters.value,
      },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await stringKeyDetailsView.isElementDisplayed(
        stringKeyDetailsView.loadAllStringValue,
      ),
    ).false

    await webView.switchToFrame(Views.TreeView)
    await treeView.openKeyDetailsByKeyName(bigStringKeyParameters.keyName)
    await webView.switchBack()

    expect(
      await stringKeyDetailsView.isElementDisplayed(
        stringKeyDetailsView.loadAllStringValue,
      ),
    ).true

    await ButtonActions.clickElement(stringKeyDetailsView.loadAllStringValue)
    expect(
      (
        await stringKeyDetailsView.getElementText(
          stringKeyDetailsView.keyStringValue,
        )
      ).length,
    ).eql(
      bigStringKeyParameters.value.length,
      'String key > 5000 value is not fully loaded after clicking Load All',
    )
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

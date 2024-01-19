import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser, Workbench } from 'vscode-extension-tester'
import {
  WebView,
  HashKeyDetailsView,
  KeyTreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonsActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyActions } from '@e2eSrc/helpers/KeysActions'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

let keyName: string

describe('Hash Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: HashKeyDetailsView
  let keyTreeView: KeyTreeView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new HashKeyDetailsView()
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
  it('Verify that user can search by full field name in Hash', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'hashField11111'
    const keyValue = 'hashValue11111!'
    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: keyFieldValue,
          value: keyValue,
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

    const commands = ['hashField*', '*11111', 'hash*11111']
    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)

    for (const c of commands) {
      await keyDetailsView.searchByTheValueInKeyDetails(c)
      // Check the search result
      let result = await (
        await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
      )[0].getText()
      expect(result).eqls(keyFieldValue)
      expect(result.length).eqls(1)
      await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)
    }
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

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await keyDetailsView.searchByTheValueInKeyDetails(
      keyToAddParameters2.fieldStartWith + '*',
    )
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(result).contains(keyToAddParameters2.fieldStartWith)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)
  })
  it('Verify that user can search by full field name in Hash', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'hashField11111'
    const keyValue = 'hashValue11111!'
    const deleteMessage = 'Key has been deleted'

    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: keyFieldValue,
          value: keyValue,
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

    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let resultField = await (
      await keyDetailsView.getElements(keyDetailsView.hashFieldsList)
    )[0].getText()
    expect(resultField).eqls(keyFieldValue)
    expect(resultField.length).eqls(1)
    let resultValue = await (
      await keyDetailsView.getElements(keyDetailsView.hashValuesList)
    )[0].getText()
    expect(resultValue).eqls(keyValue)
    await keyDetailsView.removeRowByField(KeyTypesShort.Hash, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.Hash,
      keyFieldValue,
    )
    await webView.switchBack()

    const notifications = await new Workbench().getNotifications()
    const notification = notifications[0]
    // get the message
    const message = await notification.getMessage()
    expect(message).eqls(deleteMessage)
  })
})

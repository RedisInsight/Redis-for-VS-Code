import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { ActivityBar, VSBrowser, Workbench } from 'vscode-extension-tester'
import { WebView, SetKeyDetailsView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonsActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { SetKeyParameters } from '@e2eSrc/helpers/types/types'
import { KeyActions } from '@e2eSrc/helpers/KeysActions'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { Views } from '@e2eSrc/page-objects/components/WebView'

let keyName: string

describe('Set Key fields verification', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: SetKeyDetailsView

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new SetKeyDetailsView()

    await browser.waitForWorkbench(20_000)
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })
  it('Verify that user can search and delete by member in Set', async function () {
    keyName = Common.generateWord(10)
    const keyFieldValue = 'setField11111'
    const setKeyParameters: SetKeyParameters = {
      keyName: keyName,
      members: [keyFieldValue],
    }
    const keyToAddParameters = {
      fieldsCount: 1,
      keyName,
      fieldStartWith: 'setField',
    }

    await KeyAPIRequests.addSetKeyApi(
      setKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Add fields to the hash key
    await KeyActions.populateSetWithMembers(
      Config.ossStandaloneConfig.host,
      Config.ossStandaloneConfig.port,
      keyToAddParameters,
    )

    // Open key details iframe
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    await keyDetailsView.searchByTheValueInKeyDetails(keyFieldValue)
    // Check the search result
    let result = await (
      await keyDetailsView.getElements(keyDetailsView.setFieldsList)
    )[0].getText()
    expect(result).contains(keyFieldValue)
    await ButtonsActions.clickElement(keyDetailsView.clearSearchInput)
    await ButtonsActions.clickElement(keyDetailsView.keyRefresh)

    await keyDetailsView.removeRowByField(KeyTypesShort.Set, keyFieldValue)
    await keyDetailsView.clickRemoveRowButtonByField(
      KeyTypesShort.Set,
      keyFieldValue,
    )
    await webView.switchBack()
    let notifications = await new Workbench().getNotifications()
    let notification = notifications[0]
    // get the message
    let message = await notification.getMessage()
    expect(message).eqls(`Member has been deleted`)

    await webView.switchToFrame(Views.KeyDetailsView)
    await keyDetailsView.removeFirstRow(KeyTypesShort.Set)
    await webView.switchBack()

    notifications = await new Workbench().getNotifications()
    notification = notifications[0]
    // get the message
    message = await notification.getMessage()
    expect(message).eqls(`${keyName} has been deleted.`)
  })
})

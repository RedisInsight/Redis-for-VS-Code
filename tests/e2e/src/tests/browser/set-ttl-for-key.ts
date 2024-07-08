import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import {
  BottomBar,
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
import { SetKeyParameters } from '@e2eSrc/helpers/types/types'

describe('Set TTL for Key', () => {
  let bottomBar: BottomBar
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView

  before(async () => {
    bottomBar = new BottomBar()
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  it('Verify that user can specify TTL for Key', async function () {
    const ttlValue = '2147476121'
    const keyName = Common.generateWord(20)
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
    await InputActions.slowType(keyDetailsView.editTtlInput, ttlValue)
    await ButtonActions.clickElement(keyDetailsView.applyTtlInputBtn)
    await CommonDriverExtension.driverSleep(1000)
    await ButtonActions.clickElement(keyDetailsView.refreshKeyButton)
    await CommonDriverExtension.driverSleep(1000)
    const newTtlValue = Number(
      await InputActions.getInputValue(keyDetailsView.editTtlInput),
    )
    expect(Number(ttlValue)).gt(newTtlValue)
  })
})

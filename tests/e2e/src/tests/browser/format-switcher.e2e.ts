import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import {
  CliAPIRequests,
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { Common } from '@e2eSrc/helpers/Common'
import { Config } from '@e2eSrc/helpers/Conf'
import { TreeView, KeyDetailsView } from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  DatabasesActions,
  DropdownActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import {
  keyTypesShort,
  Formatters,
  KeyTypesShort,
} from '@e2eSrc/helpers/constants'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { EditorView } from 'vscode-extension-tester'

describe('Format switcher functionality', () => {
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView
  let editorView: EditorView

  let keysData = keyTypesShort
    .map((object: any) => ({ ...object }))
    .filter((v: any, i: number) => i <= 6 && i !== 5)
  keysData.forEach(
    (key: { keyName: string }) =>
      (key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(6)}`),
  )
  const databasesForAdding = [
    {
      host: Config.ossStandaloneConfig.host,
      port: Config.ossStandaloneConfig.port,
      databaseName: 'testDB1',
    },
    {
      host: Config.ossStandaloneConfig.host,
      port: Config.ossStandaloneConfig.port,
      databaseName: 'testDB2',
    },
  ]

  before(async () => {
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()
    editorView = new EditorView()

    await DatabaseAPIRequests.addNewStandaloneDatabaseApi(databasesForAdding[1])
    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      databasesForAdding[0],
    )
  })
  beforeEach(async () => {
    keysData = keyTypesShort
      .map((object: any) => ({ ...object }))
      .filter((v: any, i: number) => i <= 6 && i !== 5)
    keysData.forEach(
      (key: { keyName: string }) =>
        (key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(6)}`),
    )
    await KeyAPIRequests.addKeysApi(
      keysData,
      databasesForAdding[0].databaseName,
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await CliAPIRequests.sendRedisCliCommandApi(
      `FLUSHDB`,
      databasesForAdding[0],
    )
    await keyDetailsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  it(`Formatters saved selection`, async function () {
    // Refresh database
    await treeView.refreshDatabaseByName(databasesForAdding[0].databaseName)

    // Open key details and select JSON formatter
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keysData[0].keyName)
    await keyDetailsView.selectFormatter(Formatters.JSON)
    // Reopen key details
    await keyDetailsView.switchBack()
    await editorView.closeEditor(KeyTypesShort.Hash + ':' + keysData[0].keyName)
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keysData[0].keyName)
    // Verify that formatters selection is saved when user switches between keys
    expect(
      await DropdownActions.getDropdownValue(keyDetailsView.formatSwitcher),
    ).eql(
      Formatters.JSON,
      'Formatter value is not saved when switching between keys',
    )
    // Verify that formatters selection is saved when user reloads the page
    await ButtonActions.clickElement(keyDetailsView.refreshKeyButton)
    await keyDetailsView.switchBack()
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keysData[1].keyName)
    expect(
      await DropdownActions.getDropdownValue(keyDetailsView.formatSwitcher),
    ).eql(Formatters.JSON, 'Formatter value is not saved when reloading page')
    // Go to another database
    await keyDetailsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.clickDatabaseByName(databasesForAdding[1].databaseName)
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keysData[3].keyName)
    // Verify that formatters selection is saved when user switches between databases
    expect(
      await DropdownActions.getDropdownValue(keyDetailsView.formatSwitcher),
    ).eql(
      Formatters.JSON,
      'Formatter value is not saved when switching between databases',
    )
  })
})

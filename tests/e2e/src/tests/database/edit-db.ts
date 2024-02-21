import { expect } from 'chai'
import { VSBrowser } from 'vscode-extension-tester'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import {
  WebView,
  TreeView,
  EditDatabaseView,
} from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Common, CommonDriverExtension, Config } from '@e2eSrc/helpers'

describe('Edit Databases', () => {
  let browser: VSBrowser
  let webView: WebView
  let treeView: TreeView
  let editDatabaseView: EditDatabaseView

  const database = Object.assign({}, Config.ossStandaloneTlsConfig)
  const newDatabaseName = Common.generateWord(20)

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    treeView = new TreeView()
    editDatabaseView = new EditDatabaseView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(database)
    await treeView.editDatabaseByName(database.databaseName)
    await webView.switchBack()
    await webView.switchToFrame(Views.DatabaseDetailsView)
  })
  afterEach(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  // TODO unskip after implementing edit of DB alias
  it.skip('Verify that user can edit DB alias of Standalone DB', async function () {
    // Verify that timeout input is displayed for edit db window with default value when it wasn't specified
    const timeoutValue = await (
      await editDatabaseView.getElement(editDatabaseView.timeoutInput)
    ).getAttribute('value')
    expect(timeoutValue).eql('30', 'Timeout is not defaulted to 30')

    await ButtonActions.clickElement(editDatabaseView.editAliasButton)
    // Fill the add database form
    await InputActions.typeText(editDatabaseView.aliasInput, newDatabaseName)
    ButtonActions.clickElement(editDatabaseView.saveDatabaseButton)
    // TODO Verify that database has new alias
  })
  it('Verify that user can edit Standalone DB', async function () {
    const connectionTimeout = '20'
    await CommonDriverExtension.driverSleep(10000)
    const caCertFieldValue = await (
      await editDatabaseView.getElement(editDatabaseView.caCertField)
    ).getText()
    const clientCertFieldValue = await (
      await editDatabaseView.getElement(editDatabaseView.clientCertField)
    ).getText()

    expect(caCertFieldValue).contains('ca', 'CA certificate is incorrect')
    expect(clientCertFieldValue).contains(
      'client',
      'Client certificate is incorrect',
    )

    await InputActions.typeText(
      editDatabaseView.timeoutInput,
      connectionTimeout,
    )
    ButtonActions.clickElement(editDatabaseView.saveDatabaseButton)
    await webView.switchBack()
    await DatabasesActions.verifyDatabaseEdited()
  })
})

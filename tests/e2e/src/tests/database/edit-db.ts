import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { TreeView, EditDatabaseView } from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'
import { Common, Config } from '@e2eSrc/helpers'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'

describe('Edit Databases', () => {
  let treeView: TreeView
  let editDatabaseView: EditDatabaseView

  const database = Object.assign({}, Config.ossStandaloneTlsConfig)
  const newDatabaseName = Common.generateWord(20)

  before(async () => {
    treeView = new TreeView()
    editDatabaseView = new EditDatabaseView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(database)
  })
  beforeEach(async () => {
    await treeView.editDatabaseByName(database.databaseName)
    await treeView.switchBack()
    await editDatabaseView.switchToInnerViewFrame(
      InnerViews.EditDatabaseInnerView,
    )
  })
  afterEach(async () => {
    await editDatabaseView.switchBack()
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
    await ButtonActions.clickElement(editDatabaseView.saveDatabaseButton)
    // TODO Verify that database has new alias
  })

  it('Verify that user can edit Standalone DB', async function () {
    const connectionTimeout = '20'
    const caCertFieldValue = await editDatabaseView.getElementText(
      editDatabaseView.caCertField,
    )
    const clientCertFieldValue = await editDatabaseView.getElementText(
      editDatabaseView.clientCertField,
    )

    expect(caCertFieldValue).contains('ca', 'CA certificate is incorrect')
    expect(clientCertFieldValue).contains(
      'client',
      'Client certificate is incorrect',
    )

    await InputActions.typeText(
      editDatabaseView.timeoutInput,
      connectionTimeout,
    )
    await ButtonActions.clickElement(editDatabaseView.saveDatabaseButton)
    await editDatabaseView.switchBack()
    await DatabasesActions.verifyDatabaseEdited()
  })
})

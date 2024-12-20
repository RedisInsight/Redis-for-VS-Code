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

  beforeEach(async () => {
    treeView = new TreeView()
    editDatabaseView = new EditDatabaseView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(database)
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

  it('Verify that user can edit DB alias of Standalone DB', async function () {
    // Verify that timeout input is displayed for edit db window with default value when it wasn't specified
    const timeoutValue = await editDatabaseView.getElementAttribute(
      editDatabaseView.timeoutInput,
      'value',
    )
    expect(timeoutValue).eql('30', 'Timeout is not defaulted to 30')

    await InputActions.typeText(editDatabaseView.aliasInput, newDatabaseName)
    await ButtonActions.clickElement(editDatabaseView.saveDatabaseButton)
    // Verify that database has new alias
    await treeView.switchBack()
    await editDatabaseView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    expect(
      await treeView.waitForElementVisibility(
        treeView.getDatabaseByName(newDatabaseName),
      ),
    ).eql(true, `The database with new alias is in not the list`)
    expect(
      await treeView.isElementDisplayed(
        treeView.getDatabaseByName(database.databaseName),
      ),
    ).eql(false, `The database with previous alias is still in the list`)
  })

  it('Verify that user can edit Standalone DB', async function () {
    const connectionTimeout = '20'
    const caCertFieldValue = await editDatabaseView.getElementText(
      editDatabaseView.caCertField,
    )
    const clientCertFieldValue = await editDatabaseView.getElementText(
      editDatabaseView.clientCertField,
    )

    expect(caCertFieldValue).not.contains(
      'NO_CA_CERT',
      'CA certificate is incorrect',
    )
    expect(clientCertFieldValue).not.contains(
      'ADD_NEW',
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

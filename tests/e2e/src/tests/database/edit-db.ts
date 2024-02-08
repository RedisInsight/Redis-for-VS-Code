import { expect } from 'chai'
import { ActivityBar, By, VSBrowser, Workbench } from 'vscode-extension-tester'
import { ViewElements, Views } from '@e2eSrc/page-objects/components/WebView'
import {
  WebView,
  KeyTreeView,
  EditDatabaseView,
} from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Common, CommonDriverExtension, Config } from '@e2eSrc/helpers'
import {
  sshPrivateKeyWithPasscode,
} from '@e2eSrc/test-data/sshPrivateKeys'

const sshParams = {
  sshHost: '172.31.100.245',
  sshPort: '2222',
  sshUsername: 'u',
}
// const sshDbPrivateKey = {
//   ...Config.ossStandaloneForSSHConfig,
//   databaseName: `SSH_${Common.generateWord(5)}`,
// }
const verifyDatabaseEdited = async (): Promise<void> => {
  await new WebView().switchBack()
  await CommonDriverExtension.driverSleep(1000)
  let notifications = await new Workbench().getNotifications()
  let notification = notifications[0]
  // Check the notification message
  let message = await notification.getMessage()
  expect(message).eqls(
    `Database has been edited`,
    'The notification is not displayed',
  )
  // Verify that panel is closed
  expect(
    await new EditDatabaseView().isElementDisplayed(
      By.xpath(ViewElements[Views.DatabaseDetailsView]),
    ),
  ).false
}

describe('Edit Databases', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyTreeView: KeyTreeView
  let editDatabaseView: EditDatabaseView

  const database = Object.assign({}, Config.ossStandaloneTlsConfig)
  const newDatabaseName = Common.generateWord(20)

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyTreeView = new KeyTreeView()
    editDatabaseView = new EditDatabaseView()

    await DatabaseAPIRequests.addNewStandaloneDatabaseApi(database)
    await browser.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)
    await ButtonActions.clickElement(keyTreeView.editDatabaseBtn)
    await webView.switchBack()
    await webView.switchToFrame(Views.DatabaseDetailsView)
  })
  afterEach(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  // TODO unskip after implementing switching between databases and edit of DB alias
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
  // TODO update after implementing switching between databases
  it('Verify that user can edit Standalone DB', async function () {
    const connectionTimeout = '20'
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
    await verifyDatabaseEdited()
  })
  // TODO unskip after implementing switching between databases
  // add db sshDbPrivateKey to edit it
  it.skip('Verify that user can edit SSH parameters for existing database connections', async function () {
    const hiddenPass = '••••••••••••'
    const sshWithPassphrase = {
      ...sshParams,
      sshPrivateKey: sshPrivateKeyWithPasscode,
      sshPassphrase: 'test',
    }

    // Verify that password, passphrase and private key are hidden for SSH option
    expect(
      await InputActions.getInputValue(editDatabaseView.sshPrivateKeyInput),
    ).eql(hiddenPass, 'Private Key not hidden for SSH on edit')
    expect(
      await InputActions.getInputValue(editDatabaseView.sshPassphraseInput),
    ).eql(hiddenPass, 'Passphrase not hidden for SSH on edit')

    await InputActions.typeText(
      editDatabaseView.sshPrivateKeyInput,
      sshWithPassphrase.sshPrivateKey,
    )
    InputActions.typeText(
      editDatabaseView.sshPassphraseInput,
      sshWithPassphrase.sshPassphrase,
    )
    await ButtonActions.clickElement(editDatabaseView.saveDatabaseButton)

    await verifyDatabaseEdited()
  })
})

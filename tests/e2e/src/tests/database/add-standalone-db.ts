import { expect } from 'chai'
import { ActivityBar, By, VSBrowser, Workbench } from 'vscode-extension-tester'
import { ViewElements, Views } from '@e2eSrc/page-objects/components/WebView'
import {
  WebView,
  KeyTreeView,
  DatabaseDetailsView,
  KeyDetailsView,
  AddDatabaseView,
} from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  CheckboxActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Common, Config } from '@e2eSrc/helpers'
import {
  sshPrivateKey,
  sshPrivateKeyWithPasscode,
} from '../../test-data/sshPrivateKeys'

const sshParams = {
  sshHost: '172.31.100.245',
  sshPort: '2222',
  sshUsername: 'u',
}
const sshDbPass = {
  ...Config.ossStandaloneForSSHConfig,
  databaseName: `SSH_${Common.generateWord(5)}`,
}
const sshDbPrivateKey = {
  ...Config.ossStandaloneForSSHConfig,
  databaseName: `SSH_${Common.generateWord(5)}`,
}
const sshDbPasscode = {
  ...Config.ossStandaloneForSSHConfig,
  databaseName: `SSH_${Common.generateWord(5)}`,
}
const verifyDatabaseAdded = async (): Promise<void> => {
  let databaseDetailsView = new DatabaseDetailsView()
  let notifications = await new Workbench().getNotifications()
  let notification = notifications[0]
  // Check the notification message
  let message = await notification.getMessage()
  expect(message).eqls(
    `Database has been added`,
    'The notification is not displayed',
  )

  // Verify that panel is closed
  expect(
    await databaseDetailsView.isElementDisplayed(
      By.xpath(ViewElements[Views.DatabaseDetailsView]),
    ),
  ).false
}

describe('Add database', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyDetailsView: KeyDetailsView
  let keyTreeView: KeyTreeView
  let databaseDetailsView: DatabaseDetailsView
  let addDatabaseView: AddDatabaseView

  let databaseName = `test_standalone-${Common.generateString(10)}`

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyDetailsView = new KeyDetailsView()
    keyTreeView = new KeyTreeView()
    databaseDetailsView = new DatabaseDetailsView()
    addDatabaseView = new AddDatabaseView()

    await browser.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)
    await ButtonActions.clickElement(keyTreeView.addDatabaseBtn)
    await webView.switchBack()
    await webView.switchToFrame(Views.DatabaseDetailsView)
  })
  afterEach(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteStandaloneDatabasesByNamesApi([
      databaseName,
      Config.ossClusterConfig.ossClusterDatabaseName,
    ])
  })
  it('Verify that user can add Standalone Database', async function () {
    const connectionTimeout = '20'
    databaseName = `test_standalone-${Common.generateString(10)}`

    // Fill the add database form
    await InputActions.typeText(
      databaseDetailsView.hostInput,
      Config.ossStandaloneConfig.host,
    )
    await InputActions.typeText(
      databaseDetailsView.portInput,
      Config.ossStandaloneConfig.port,
    )
    await InputActions.typeText(
      databaseDetailsView.databaseAliasInput,
      databaseName,
    )
    // Verify that user can customize the connection timeout for the manual flow
    await InputActions.typeText(
      databaseDetailsView.timeoutInput,
      connectionTimeout,
    )
    ButtonActions.clickElement(databaseDetailsView.saveDatabaseButton)
    await verifyDatabaseAdded()
    // TODO:
    // Wait for database to be exist
    // Verify that user can see an indicator of databases that are added manually and not opened yet
    // Verify that user can't see an indicator of databases that were opened
    // Verify that connection timeout value saved
  })
  it('Verify that user can add OSS Cluster DB', async function () {
    await addDatabaseView.addOssClusterDatabase(Config.ossClusterConfig)
    // Check for info message that DB was added
    await verifyDatabaseAdded()
    // TODO Wait for database to be exist
    // TODO Verify new connection badge for OSS cluster
  })
  it('Fields to add database prepopulation', async function () {
    const defaultHost = '127.0.0.1'
    const defaultPort = '6379'
    // const defaultSentinelPort = '26379'

    // Verify that the Host, Port, Database Alias values pre-populated by default for the manual flow
    expect(await InputActions.getInputValue(databaseDetailsView.hostInput)).eql(
      defaultHost,
      'Default host not prepopulated',
    )
    expect(await InputActions.getInputValue(databaseDetailsView.portInput)).eql(
      defaultPort,
      'Default port not prepopulated',
    )
    expect(
      await InputActions.getInputValue(databaseDetailsView.databaseAliasInput),
    ).eql(`${defaultHost}:${defaultPort}`, 'Default db alias not prepopulated')

    // TODO add once db autodiscovery implemented:
    // Verify that the Host, Port, Database Alias values pre-populated by default for Sentinel
  })
  it('Verify that user can add SSH tunnel with Password for Standalone database', async function () {
    const sshWithPass = {
      ...sshParams,
      sshPassword: 'pass',
    }

    await addDatabaseView.addStandaloneSSHDatabase(sshDbPass, sshWithPass)
    await verifyDatabaseAdded()
  })
  it('Verify that user can add SSH tunnel with Private Key', async function () {
    const sshWithPrivateKey = {
      ...sshParams,
      sshPrivateKey: sshPrivateKey,
    }

    await addDatabaseView.addStandaloneSSHDatabase(
      sshDbPrivateKey,
      sshWithPrivateKey,
    )
    await verifyDatabaseAdded()
  })
  it('Verify that user can add SSH tunnel with Passcode', async function () {
    const sshWithPassphrase = {
      ...sshParams,
      sshPrivateKey: sshPrivateKeyWithPasscode,
      sshPassphrase: 'test',
    }

    await addDatabaseView.addStandaloneSSHDatabase(
      sshDbPasscode,
      sshWithPassphrase,
    )
    await verifyDatabaseAdded()
  })
  it('Verify that Add database button disabled when mandatory ssh fields not specified', async function () {
    await CheckboxActions.toggleCheckbox(databaseDetailsView.useSSHCheckbox)
    await ButtonActions.clickElement(databaseDetailsView.sshPrivateKeyRadioBtn)
    const isDisabled = await databaseDetailsView.isElementDisabled(
      databaseDetailsView.saveDatabaseButton,
      'class',
    )
    expect(isDisabled).true
  })
})

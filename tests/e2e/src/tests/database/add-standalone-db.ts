import { expect } from 'chai'
import { ActivityBar, VSBrowser } from 'vscode-extension-tester'
import {
  TreeView,
  AddDatabaseView,
  EditDatabaseView,
} from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  CheckboxActions,
  DatabasesActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Common, Config } from '@e2eSrc/helpers'
import {
  sshPrivateKey,
  sshPrivateKeyWithPasscode,
} from '../../test-data/sshPrivateKeys'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

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
const sshWithPassphrase = {
  ...sshParams,
  sshPrivateKey: sshPrivateKeyWithPasscode,
  sshPassphrase: 'test',
}

describe('Add database', () => {
  let browser: VSBrowser
  let treeView: TreeView
  let addDatabaseView: AddDatabaseView
  let editDatabaseView: EditDatabaseView

  let databaseName = `test_standalone-${Common.generateString(10)}`

  beforeEach(async () => {
    browser = VSBrowser.instance
    treeView = new TreeView()
    addDatabaseView = new AddDatabaseView()
    editDatabaseView = new EditDatabaseView()

    await browser.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('Redis Insight'))?.openView()
    await ButtonActions.clickElement(treeView.addDatabaseBtn)
    await addDatabaseView.switchToInnerViewFrame(
      InnerViews.AddDatabaseInnerView,
    )
  })
  afterEach(async () => {
    await addDatabaseView.switchBack()
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
      addDatabaseView.hostInput,
      Config.ossStandaloneConfig.host,
    )
    await InputActions.typeText(
      addDatabaseView.portInput,
      Config.ossStandaloneConfig.port,
    )
    await InputActions.typeText(
      addDatabaseView.databaseAliasInput,
      databaseName,
    )
    // Verify that user can customize the connection timeout for the manual flow
    await InputActions.typeText(addDatabaseView.timeoutInput, connectionTimeout)
    await ButtonActions.clickElement(addDatabaseView.saveDatabaseButton)
    await addDatabaseView.switchBack()
    await DatabasesActions.verifyDatabaseAdded()
    // Wait for database to be in the list
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    expect(
      await treeView.isElementDisplayed(
        treeView.getDatabaseByName(databaseName),
      ),
    ).true(`${databaseName} not added to database list`)
    // Verify that user can see an indicator of databases that are added manually and not opened yet
    // Verify that user can't see an indicator of databases that were opened
    // Verify that connection timeout value saved
  })
  it('Verify that user can add OSS Cluster DB', async function () {
    await addDatabaseView.addOssClusterDatabase(Config.ossClusterConfig)
    // Check for info message that DB was added
    await addDatabaseView.switchBack()
    await DatabasesActions.verifyDatabaseAdded()
    // Wait for database to be in the list
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    expect(
      await treeView.isElementDisplayed(
        treeView.getDatabaseByName(
          Config.ossClusterConfig.ossClusterDatabaseName,
        ),
      ),
    ).true(
      `${Config.ossClusterConfig.ossClusterDatabaseName} not added to database list`,
    )
    // TODO Verify new connection badge for OSS cluster
  })
  it('Fields to add database prepopulation', async function () {
    const defaultHost = '127.0.0.1'
    const defaultPort = '6379'
    // const defaultSentinelPort = '26379'

    // Verify that the Host, Port, Database Alias values pre-populated by default for the manual flow
    expect(await InputActions.getInputValue(addDatabaseView.hostInput)).eql(
      defaultHost,
      'Default host not prepopulated',
    )
    expect(await InputActions.getInputValue(addDatabaseView.portInput)).eql(
      defaultPort,
      'Default port not prepopulated',
    )
    expect(
      await InputActions.getInputValue(addDatabaseView.databaseAliasInput),
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
    await addDatabaseView.switchBack()
    await DatabasesActions.verifyDatabaseAdded()
    // Wait for database to be in the list
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    expect(
      await treeView.isElementDisplayed(
        treeView.getDatabaseByName(databaseName),
      ),
    ).true(`${databaseName} not added to database list`)
  })
  it('Verify that user can add SSH tunnel with Private Key', async function () {
    const hiddenPass = '••••••••••••'
    const sshWithPrivateKey = {
      ...sshParams,
      sshPrivateKey: sshPrivateKey,
    }

    await addDatabaseView.addStandaloneSSHDatabase(
      sshDbPrivateKey,
      sshWithPrivateKey,
    )
    await addDatabaseView.switchBack()
    await DatabasesActions.verifyDatabaseAdded()
    // Wait for database to be in the list
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    expect(
      await treeView.isElementDisplayed(
        treeView.getDatabaseByName(databaseName),
      ),
    ).true(`${databaseName} not added to database list`)

    await treeView.clickDatabaseByName(databaseName)
    await treeView.editDatabaseByName(databaseName)
    await treeView.switchBack()
    await addDatabaseView.switchToInnerViewFrame(
      InnerViews.AddDatabaseInnerView,
    )

    // Verify that user can edit SSH parameters for existing database connections
    await InputActions.typeText(
      editDatabaseView.sshPrivateKeyInput,
      sshWithPassphrase.sshPrivateKey,
    )
    InputActions.typeText(
      editDatabaseView.sshPassphraseInput,
      sshWithPassphrase.sshPassphrase,
    )
    await ButtonActions.clickElement(editDatabaseView.saveDatabaseButton)
    await addDatabaseView.switchBack()
    await DatabasesActions.verifyDatabaseEdited()

    // Verify that password, passphrase and private key are hidden for SSH option
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.editDatabaseByName(databaseName)
    await treeView.switchBack()
    await addDatabaseView.switchToInnerViewFrame(
      InnerViews.AddDatabaseInnerView,
    )
    expect(
      await InputActions.getInputValue(editDatabaseView.sshPrivateKeyInput),
    ).eql(hiddenPass, 'Private Key not hidden for SSH on edit')
    expect(
      await InputActions.getInputValue(editDatabaseView.sshPassphraseInput),
    ).eql(hiddenPass, 'Passphrase not hidden for SSH on edit')
  })
  it('Verify that user can add SSH tunnel with Passcode', async function () {
    await addDatabaseView.addStandaloneSSHDatabase(
      sshDbPasscode,
      sshWithPassphrase,
    )
    await addDatabaseView.switchBack()
    await DatabasesActions.verifyDatabaseAdded()
    // Wait for database to be in the list
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    expect(
      await treeView.isElementDisplayed(
        treeView.getDatabaseByName(databaseName),
      ),
    ).true(`${databaseName} not added to database list`)
  })
  it('Verify that Add database button disabled when mandatory ssh fields not specified', async function () {
    await CheckboxActions.toggleCheckbox(addDatabaseView.useSSHCheckbox)
    await ButtonActions.clickElement(addDatabaseView.sshPrivateKeyRadioBtn)
    const isDisabled = await addDatabaseView.isElementDisabled(
      addDatabaseView.saveDatabaseButton,
      'class',
    )
    expect(isDisabled).true
  })
})

import {
  ButtonActions,
  CheckboxActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseDetailsView } from './DatabaseDetailsView'
import {
  AddNewDatabaseParameters,
  OSSClusterParameters,
  SSHParameters,
} from '@e2eSrc/helpers/types/types'

/**
 * Add Database view
 */
export class AddDatabaseView extends DatabaseDetailsView {
  /**
   * Add OSS Cluster database
   * @param parameters - Parameters of OSS Cluster
   */
  async addOssClusterDatabase(parameters: OSSClusterParameters): Promise<void> {
    if (!!parameters.ossClusterHost) {
      await InputActions.typeText(this.hostInput, parameters.ossClusterHost)
    }
    if (!!parameters.ossClusterPort) {
      await InputActions.typeText(this.portInput, parameters.ossClusterPort)
    }
    if (!!parameters.ossClusterDatabaseName) {
      await InputActions.typeText(
        this.databaseAliasInput,
        parameters.ossClusterDatabaseName,
      )
    }
    await ButtonActions.clickElement(this.saveDatabaseButton)
  }

  /**
   * Adding a new standalone database with SSH
   * @param databaseParameters the parameters of the database
   * @param sshParameters the parameters of ssh
   */
  async addStandaloneSSHDatabase(
    databaseParameters: AddNewDatabaseParameters,
    sshParameters: SSHParameters,
  ): Promise<void> {
    await InputActions.typeText(this.hostInput, databaseParameters.host)
    await InputActions.typeText(this.portInput, databaseParameters.port)
    await InputActions.typeText(
      this.databaseAliasInput,
      databaseParameters.databaseName!,
    )

    if (!!databaseParameters.databaseUsername) {
      await InputActions.typeText(
        this.usernameInput,
        databaseParameters.databaseUsername,
      )
    }
    if (!!databaseParameters.databasePassword) {
      await InputActions.typeText(
        this.passwordInput,
        databaseParameters.databasePassword,
      )
    }
    // Select SSH Tunnel checkbox
    await CheckboxActions.toggleCheckbox(this.useSSHCheckbox)
    // Enter SSH fields
    await InputActions.typeText(this.sshHostInput, sshParameters.sshHost)
    await InputActions.typeText(this.sshPortInput, sshParameters.sshPort)
    await InputActions.typeText(
      this.sshUsernameInput,
      sshParameters.sshUsername,
    )
    if (!!sshParameters.sshPassword) {
      await InputActions.typeText(
        this.sshPasswordInput,
        sshParameters.sshPassword,
      )
    }
    if (!!sshParameters.sshPrivateKey) {
      await ButtonActions.clickElement(this.sshPrivateKeyRadioBtn)
      await InputActions.typeText(
        this.sshPrivateKeyInput,
        sshParameters.sshPrivateKey,
      )
    }
    if (!!sshParameters.sshPassphrase) {
      await ButtonActions.clickElement(this.sshPrivateKeyRadioBtn)
      await InputActions.typeText(
        this.sshPrivateKeyInput,
        sshParameters.sshPrivateKey!,
      )
      await InputActions.typeText(
        this.sshPassphraseInput,
        sshParameters.sshPassphrase,
      )
    }
    // Click for saving
    await ButtonActions.clickElement(this.saveDatabaseButton)
  }

  /**
   * Adding a new redis database
   * @param parameters the parameters of the database
   */
  async addRedisDataBase(parameters: AddNewDatabaseParameters): Promise<void> {
    await InputActions.typeText(this.hostInput, parameters.host)
    await InputActions.typeText(this.portInput, parameters.port)
    await InputActions.typeText(
      this.databaseAliasInput,
      parameters.databaseName!,
    )
    if (!!parameters.databaseUsername) {
      await InputActions.typeText(
        this.usernameInput,
        parameters.databaseUsername,
      )
    }
    if (!!parameters.databasePassword) {
      await InputActions.typeText(
        this.passwordInput,
        parameters.databasePassword,
      )
    }
  }
}

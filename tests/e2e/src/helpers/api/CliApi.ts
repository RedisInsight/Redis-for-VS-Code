import { expect } from 'chai'
import { AddNewDatabaseParameters } from '../types/types'
import { CommonAPIRequests } from './CommonApi'
import { DatabaseAPIRequests } from './DatabaseApi'

const databaseAPIRequests = new DatabaseAPIRequests()

export class CliAPIRequests {
  /**
   * Create Redis client for CLI
   * @param dbInstance The database id
   */
  static async createRedisClientForCli(dbInstance: string): Promise<string> {
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${dbInstance}/cli`,
    )
    expect(response.status).eql(
      201,
      'The creation of new CLI client request failed',
    )
    return response.body.uuid
  }

  /**
   * Delete Redis CLI client
   * @param dbInstance The database id
   * @param uuid The CLI client id
   */
  static async deleteRedisClientForCli(
    dbInstance: string,
    uuid: string,
  ): Promise<void> {
    const response = await CommonAPIRequests.sendDeleteRequest(
      `/databases/${dbInstance}/cli/${uuid}`,
    )
    expect(response.status).eql(
      200,
      'The deletion of CLI client request failed',
    )
  }

  /**
   * Send Redis CLI command
   * @param command The command to send
   * @param databaseParameters The database parameters
   */
  static async sendRedisCliCommandApi(
    command: string,
    databaseParameters: AddNewDatabaseParameters,
  ): Promise<void> {
    const dbInstance = await databaseAPIRequests.getDatabaseIdByName(
      databaseParameters.databaseName,
    )
    const uuid = await this.createRedisClientForCli(dbInstance)
    const requestBody = {
      command,
      outputFormat: 'RAW',
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${dbInstance}/cli/${uuid}/send-command`,
      requestBody,
    )

    expect(response.status).eql(200, 'Send CLI command request failed')
    await this.deleteRedisClientForCli(dbInstance, uuid)
  }
}

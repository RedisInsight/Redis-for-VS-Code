import { expect } from 'chai'
import { DatabaseAPIRequests } from './DatabaseApi'
import { CommonAPIRequests } from './CommonApi'

const databaseAPIRequests = new DatabaseAPIRequests()

const bufferPathMask = '/databases/databaseId/keys?encoding=buffer'
export class KeyAPIRequests {
  /**
   * Search Key by name
   * @param keyName The key name
   * @param databaseName The database name
   */
  static async searchKeyByNameApi(
    keyName: string,
    databaseName: string,
  ): Promise<string[]> {
    const requestBody = {
      cursor: '0',
      match: keyName,
    }
    const databaseId =
      await databaseAPIRequests.getDatabaseIdByName(databaseName)
    const response = await CommonAPIRequests.sendPostRequest(
      bufferPathMask.replace('databaseId', databaseId),
      requestBody,
    )
    expect(response.status).eql(200, 'Getting key request failed')
    return await response.body[0].keys
  }

  /**
   * Delete Key by name if it exists
   * @param keyName The key name
   * @param databaseName The database name
   */
  static async deleteKeyByNameApi(
    keyName: string,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await databaseAPIRequests.getDatabaseIdByName(databaseName)
    const isKeyExist = await this.searchKeyByNameApi(keyName, databaseName)
    if (isKeyExist.length > 0) {
      const requestBody = { keyNames: [Buffer.from(keyName, 'utf-8')] }
      const response = await CommonAPIRequests.sendDeleteRequest(
        bufferPathMask.replace('databaseId', databaseId),
        requestBody,
      )
      expect(response.status).eql(200, 'The deletion of the key request failed')
    }
  }
}

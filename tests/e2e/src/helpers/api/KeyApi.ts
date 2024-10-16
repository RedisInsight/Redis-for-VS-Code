import { expect } from 'chai'
import { DatabaseAPIRequests } from './DatabaseApi'
import { CommonAPIRequests } from './CommonApi'
import {
  HashKeyParameters,
  JsonKeyParameters,
  KeyData,
  ListKeyParameters,
  Result,
  SetKeyParameters,
  SortedSetKeyParameters,
  StreamKeyParameters,
  StringKeyParameters,
} from '../types/types'
import { Key } from '../common-actions/KeyActions'

const getKeysPathMask = '/databases/databaseId/keys/get-info?encoding=buffer'
const bufferPathMask = '/databases/databaseId/keys?encoding=buffer'

export class KeyAPIRequests {
  /**
   * Add Hash key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   */
  static async addHashKeyApi(
    keyParameters: HashKeyParameters,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody = {
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      fields: keyParameters.fields.map(fields => ({
        ...fields,
        field: Buffer.from(fields.field, 'utf-8'),
        value: Buffer.from(fields.value, 'utf-8'),
      })),
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/hash?encoding=buffer`,
      requestBody,
    )

    expect(response.status).eql(
      201,
      'The creation of new Hash key request failed',
    )
  }

  /**
   * Add Stream key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   */
  static async addStreamKeyApi(
    keyParameters: StreamKeyParameters,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody = {
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      entries: keyParameters.entries.map(member => ({
        ...member,
        fields: member.fields.map(({ name, value }) => ({
          name: Buffer.from(name, 'utf-8'),
          value: Buffer.from(value, 'utf-8'),
        })),
      })),
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/streams?encoding=buffer`,
      requestBody,
    )
    expect(response.status).eql(
      201,
      'The creation of new Stream key request failed',
    )
  }

  /**
   * Add Set key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   */
  static async addSetKeyApi(
    keyParameters: SetKeyParameters,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody = {
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      members: keyParameters.members.map(member =>
        Buffer.from(member, 'utf-8'),
      ),
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/set?encoding=buffer`,
      requestBody,
    )

    expect(response.status).eql(
      201,
      'The creation of new Set key request failed',
    )
  }

  /**
   * Add Sorted Set key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   */
  static async addSortedSetKeyApi(
    keyParameters: SortedSetKeyParameters,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody = {
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      members: keyParameters.members.map(member => ({
        ...member,
        name: Buffer.from(member.name, 'utf-8'),
      })),
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/zSet?encoding=buffer`,
      requestBody,
    )

    expect(response.status).eql(
      201,
      'The creation of new Sorted Set key request failed',
    )
  }

  /**
   * Add List key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   */
  static async addListKeyApi(
    keyParameters: ListKeyParameters,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody = {
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      elements: keyParameters.element.map(el => Buffer.from(el, 'utf-8'))
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/list?encoding=buffer`,
      requestBody,
    )

    expect(response.status).eql(
      201,
      'The creation of new List key request failed',
    )
  }

  /**
   * Add Elements to List key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   * @param destination The database name
   */
  static async addElementsToListKeyApi(
    keyParameters: ListKeyParameters,
    databaseName: string,
    destination: 'TAIL' | 'HEAD',
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody = {
      destination,
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      elements: keyParameters.element.map(el => Buffer.from(el, 'utf-8'))
    }
    const response = await CommonAPIRequests.sendPutRequest(
      `/databases/${databaseId}/list?encoding=buffer`,
      requestBody,
    )

    expect(response.status).eql(200, 'The updating of List key request failed')
  }

  /**
   * Add String key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   */
  static async addStringKeyApi(
    keyParameters: StringKeyParameters,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody: { keyName: Buffer; value: Buffer; expire?: number } = {
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      value: Buffer.from(keyParameters.value, 'utf-8'),
    }

    if (keyParameters.hasOwnProperty('expire')) {
      requestBody.expire = keyParameters.expire
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/string?encoding=buffer`,
      requestBody,
    )

    expect(response.status).eql(
      201,
      'The creation of new string key request failed',
    )
  }

  /**
   * Add JSON key
   * @param keyParameters The key parameters
   * @param databaseName The database name
   */
  static async addJsonKeyApi(
    keyParameters: JsonKeyParameters,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const requestBody: { keyName: Buffer; data: string; expire?: number } = {
      keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
      data: keyParameters.data,
    }

    if (keyParameters.hasOwnProperty('expire')) {
      requestBody.expire = keyParameters.expire
    }
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/rejson-rl?encoding=buffer`,
      requestBody,
    )
    expect(response.status).eql(
      201,
      'The creation of new json key request failed',
    )
  }

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
      keyName: keyName,
    }
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const response = await CommonAPIRequests.sendPostRequest(
      getKeysPathMask.replace('databaseId', databaseId),
      requestBody,
    )
    return await response.body
  }

  /**
   * Delete Key by name
   * @param keyName The key name
   * @param databaseName The database name
   */
  static async deleteKeyByNameApi(
    keyName: string,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
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

  /**
   * Search Key by name if exists
   * @param keyName The key name
   * @param databaseName The database name
   * @returns Key if exists else undefined
   */
  static async searchKeyIfExistsApi(
    keyName: string,
    databaseName: string,
  ): Promise<Result<string[], string>> {
    const requestBody = {
      keyName: keyName,
    }
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const response = await CommonAPIRequests.sendPostRequest(
      getKeysPathMask.replace('databaseId', databaseId),
      requestBody,
    )
    if ((await response.status) === 200) {
      return { success: true, value: response.body }
    } else {
      return { success: false, error: 'Failed to retrieve key' }
    }
  }

  /**
   * Delete Key by name if it exists
   * @param keyName The key name
   * @param databaseName The database name
   */
  static async deleteKeyIfExistsApi(
    keyName: string,
    databaseName: string,
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const isKeyExist = await this.searchKeyIfExistsApi(keyName, databaseName)
    if (isKeyExist.success === true) {
      const requestBody = { keyNames: [Buffer.from(keyName, 'utf-8')] }
      const response = await CommonAPIRequests.sendDeleteRequest(
        bufferPathMask.replace('databaseId', databaseId),
        requestBody,
      )
      expect(response.status).eql(200, 'The deletion of the key request failed')
    } else {
      console.log(`Key '${keyName}' does not exist. Skipping deletion.`)
    }
  }

  /**
   * Add key via API
   * @param keyData The key data
   * @param databaseName The database name
   * @param keyField The key field
   * @param keyValue The key field value
   */
  static async addKeyApi(
    keyData: KeyData,
    databaseName: string,
    keyField: string = 'test_field',
    keyValue: string = 'test_value',
  ): Promise<void> {
    const databaseId =
      await DatabaseAPIRequests.getDatabaseIdByName(databaseName)
    const key = new Key(keyData.keyName, keyData.keyType, keyField, keyValue)
    const requestBody = await key.getRequestBody()
    const response = await CommonAPIRequests.sendPostRequest(
      `/databases/${databaseId}/${keyData.keyType}?encoding=buffer`,
      requestBody,
    )

    expect(response.status).eql(
      201,
      `The creation of new ${keyData.keyType} key request failed`,
    )
  }

  /**
   * Add keys via API
   * @param keyData The key data
   * @param databaseName The database name
   * @param keyField The key field
   * @param keyValue The key field value
   */
  static async addKeysApi(
    keyData: KeyData[],
    databaseName: string,
    keyField = 'test_field',
    keyValue = 'test_value',
  ): Promise<void> {
    for (let key of keyData) {
      await this.addKeyApi(key, databaseName, keyField, keyValue)
    }
  }
}

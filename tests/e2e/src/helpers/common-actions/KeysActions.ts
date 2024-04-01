import { KeyTypesTexts } from '../constants'
import { AddKeyArguments } from '@e2eSrc/helpers/types/types'
import { createClient } from 'redis'
import { Common } from '@e2eSrc/helpers/Common'
import { ZMember } from '@redis/client/dist/lib/commands/generic-transformers'
import { random } from 'lodash'

export class KeyActions {
  /**
   * Populate hash key with fields
   * @param host The host of database
   * @param port The port of database
   * @param keyArguments The arguments of key and its fields
   */
  static async populateHashWithFields(
    host: string,
    port: string,
    keyArguments: AddKeyArguments,
  ): Promise<void> {
    const dbConf = { url: `redis://${host}:${port}` }
    const client = createClient(dbConf)

    await client
      .on('error', err => console.error('Redis Client Error', err))
      .connect()

    if (keyArguments.fieldsCount) {
      for (let i = 0; i < keyArguments.fieldsCount; i++) {
        const field = `${keyArguments.fieldStartWith}${Common.generateWord(10)}`
        const fieldValue = `${
          keyArguments.fieldValueStartWith
        }${Common.generateWord(10)}`
        await client.hSet(keyArguments.keyName as string, field, fieldValue)
      }
    }
    await client.disconnect()
  }

  /**
   * Populate Zset key with members
   * @param host The host of database
   * @param port The port of database
   * @param keyArguments The arguments of key and its members
   */
  static async populateZSetWithMembers(
    host: string,
    port: string,
    keyArguments: AddKeyArguments,
  ): Promise<void> {
    let minScoreValue = -10
    let maxScoreValue = 10
    const members: Array<ZMember> = []
    const dbConf = { url: `redis://${host}:${port}` }
    const client = createClient(dbConf)

    await client
      .on('error', err => console.error('Redis Client Error', err))
      .connect()

    if (keyArguments.fieldsCount) {
      for (let i = 0; i < keyArguments.fieldsCount; i++) {
        const memberName = `${
          keyArguments.memberStartWith
        }${Common.generateWord(10)}`
        const scoreValue = random(minScoreValue, maxScoreValue)

        members.push({
          value: memberName,
          score: scoreValue,
        })
      }

      await client.zAdd(keyArguments.keyName as string, members)
    }

    await client.quit()
  }

  /**
   * Populate set key with members
   * @param host The host of database
   * @param port The port of database
   * @param keyArguments The arguments of key and its members
   */
  static async populateSetWithMembers(
    host: string,
    port: string,
    keyArguments: AddKeyArguments,
  ): Promise<void> {
    const dbConf = { url: `redis://${host}:${port}` }
    const client = createClient(dbConf)

    await client
      .on('error', err => console.error('Redis Client Error', err))
      .connect()

    if (keyArguments.fieldsCount) {
      for (let i = 0; i < keyArguments.fieldsCount; i++) {
        const member = `${keyArguments.memberStartWith}${Common.generateWord(
          10,
        )}`
        await client.sAdd(keyArguments.keyName as string, member)
      }
    }
    await client.quit()
  }

  /**
   * Populate list key with elements
   * @param host The host of database
   * @param port The port of database
   * @param keyArguments The arguments of key and its members
   */
  static async populateListWithElements(
    host: string,
    port: string,
    keyArguments: AddKeyArguments,
  ): Promise<void> {
    const dbConf = { url: `redis://${host}:${port}` }
    const client = createClient(dbConf)
    const elements: string[] = []

    await client
      .on('error', err => console.error('Redis Client Error', err))
      .connect()

    if (keyArguments.elementsCount) {
      for (let i = 0; i < keyArguments.elementsCount; i++) {
        const element = `${keyArguments.elementStartWith}${Common.generateWord(10)}`
        elements.push(element)
      }
      await client.lPush(keyArguments.keyName as string, elements)
    }
    await client.quit()
  }
}

export const keyTypes = [
  { textType: KeyTypesTexts.Hash, keyName: 'hash', data: 'value' },
  { textType: KeyTypesTexts.List, keyName: 'list', data: 'element' },
  { textType: KeyTypesTexts.Set, keyName: 'set', data: 'member' },
  { textType: KeyTypesTexts.ZSet, keyName: 'zset', data: 'member' },
  { textType: KeyTypesTexts.String, keyName: 'string', data: 'value' },
  { textType: KeyTypesTexts.ReJSON, keyName: 'json', data: 'data' },
  { textType: KeyTypesTexts.Stream, keyName: 'stream', data: 'field' },
  { textType: KeyTypesTexts.Graph, keyName: 'graph' },
  { textType: KeyTypesTexts.TimeSeries, keyName: 'timeSeries' },
]

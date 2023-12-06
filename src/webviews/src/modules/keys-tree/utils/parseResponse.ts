import { omit, forEach, isNull } from 'lodash'
import { KeyInfo } from 'uiSrc/interfaces'
import {
  GetKeysWithDetailsResponse,
  GetKeysWithDetailsShardResponse,
  KeysStoreData,
} from '../slice/interface'

const DEFAULT_NODE_ID = 'standalone'

export const parseKeysListResponse = (
  prevShards: Record<string, GetKeysWithDetailsShardResponse> = {},
  data: GetKeysWithDetailsResponse[] = [],
) => {
  const shards: Record<string, GetKeysWithDetailsShardResponse> = { ...prevShards }

  const result: KeysStoreData = {
    nextCursor: '0',
    total: 0,
    scanned: 0,
    keys: [] as KeyInfo[],
    shardsMeta: {},
    previousResultCount: 0,
    lastRefreshTime: 0,
  }

  data.forEach((node) => {
    const id = node.host ? `${node.host}:${node.port}` : DEFAULT_NODE_ID
    const shard = (() => {
      if (!shards[id]) {
        shards[id] = omit(node, 'keys') as GetKeysWithDetailsShardResponse
      } else {
        shards[id] = {
          ...omit(node, 'keys'),
          scanned: shards[id].scanned + node.scanned,
        } as GetKeysWithDetailsShardResponse
      }
      return shards[id]
    })()

    // summarize shard values
    if ((shard.scanned > shard.total || shard.cursor === 0) && !isNull(shard.total)) {
      shard.scanned = shard.total
    }

    // result.keys.push(...node.keys)
    result.keys = result.keys.concat(node.keys)
  })

  // summarize result numbers
  const nextCursor: (string | number)[] = []
  forEach(shards, (shard, id) => {
    if (shard.total === null) {
      result.total = shard.total
    } else {
      // we don't know how many keys we lost in total = null shard
      result.total = isNull(result.total) ? null : result.total + shard.total
    }
    result.scanned += shard.scanned

    // ignore already scanned shards on get more call
    if (shard.cursor === 0) {
      return
    }

    if (id === DEFAULT_NODE_ID) {
      nextCursor.push(shard.cursor)
    } else {
      nextCursor.push(`${id}@${shard.cursor}`)
    }
  })

  result.nextCursor = nextCursor.join('||') || '0'
  result.shardsMeta = shards

  return result
}

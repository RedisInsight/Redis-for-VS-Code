import { KeyTypes, KeyValueCompressor } from 'uiSrc/constants'
import { Nullable, RedisString } from 'uiSrc/interfaces'

export interface KeysStore {
  loading: boolean
  error: string
  isFiltered: boolean
  isSearched: boolean
  search: string
  filter: Nullable<KeyTypes>
  data: KeysStoreData
  selectedKey: {
    loading: boolean
    refreshing: boolean
    lastRefreshTime: Nullable<number>
    error: string
    data: Nullable<KeyInfo>
    length?: number
    compressor: Nullable<KeyValueCompressor>
  }
}

export interface KeysStoreData {
  total: Nullable<number>
  scanned: number
  nextCursor: string
  keys: KeyInfo[]
  shardsMeta: Record<string, GetKeysWithDetailsResponse>
  previousResultCount: number
  lastRefreshTime: Nullable<number>
  maxResults?: Nullable<number>
}

export interface GetKeyInfoResponse {
  name: RedisString
  type?: string
  ttl?: number
  size?: number
  length?: number
}

export interface GetKeysWithDetailsResponse {
  cursor: number
  total: number
  scanned: number
  keys: KeyInfo[]
  host?: string
  port?: number
  maxResults?: number
}

export interface GetKeysWithDetailsShardResponse extends GetKeysWithDetailsResponse{
  id?: string
}

export interface KeyInfo extends GetKeyInfoResponse {
  nameString?: string
  path?: string
}

import { KeyTypes } from 'uiSrc/constants'
import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'

export interface KeysStore {
  loading: boolean
  deleting: boolean
  isFiltered: boolean
  isSearched: boolean
  search: string
  filter: Nullable<KeyTypes>
  data: KeysStoreData
}

export interface KeysActions {
  loadKeys: () => void
  loadKeysFinal: () => void
  loadKeysSuccess: (data: KeysStoreData) => void
  loadMoreKeysSuccess: (data: KeysStoreData) => void
  deleteKey: () => void
  deleteKeyFinal: () => void
  deleteKeyFromList: (key: RedisString) => void
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

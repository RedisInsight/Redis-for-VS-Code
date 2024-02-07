import { KeyTypes } from 'uiSrc/constants'
import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'

export interface KeysStore {
  databaseId: Nullable<string>
  loading: boolean
  deleting: boolean
  isFiltered: boolean
  isSearched: boolean
  search: string
  filter: Nullable<KeyTypes>
  data: KeysStoreData
  addKeyLoading: boolean,
}

export interface KeysActions {
  loadKeys: () => void
  loadKeysFinal: () => void
  loadKeysSuccess: (data: KeysStoreData) => void
  loadMoreKeysSuccess: (data: KeysStoreData) => void

  deleteKey: () => void
  deleteKeyFinal: () => void
  deleteKeyFromList: (key: RedisString) => void

  // Add key
  addKey: () => void
  addKeyFinal: () => void
  addKeySuccess: (data: KeysStoreData) => void
  updateKeyList: (data: { key: RedisString, keyType: KeyTypes }) => void
  resetAddKey: () => void
  setDatabaseId: (databaseId: string) => void
}

export interface KeysThunks {
  fetchPatternKeysAction: (
    cursor?: string,
    count?: number,
    telemetryProperties?: { [key: string]: any },
    onSuccess?: (data: GetKeysWithDetailsResponse[]) => void,
    onFailed?: () => void,
  ) => void
  fetchMorePatternKeysAction: (cursor: string, count?: number) => void
  fetchKeysMetadataTree: (
    keys: RedisString[][],
    filter: Nullable<KeyTypes>,
    signal?: AbortSignal,
    onSuccessAction?: (data: KeyInfo[]) => void,
    onFailAction?: () => void,
  ) => void
  deleteKeyAction: (key: RedisString, onSuccessAction?: () => void) => void
  addStringKey: (data: SetStringWithExpire, onSuccessAction?: () => void, onFailAction?: () => void) => void
  addKeyIntoList: (data: { key: RedisString, keyType: KeyTypes }) => void
  addTypedKey: (
    data: any,
    keyType: KeyTypes,
    onSuccessAction?: () => void,
    onFailAction?: () => void
  ) => void
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

export interface SetStringWithExpire {
  keyName: RedisString
  value: RedisString
  expire?: number
}

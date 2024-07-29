import { KeyTypes } from 'uiSrc/constants'
import { KeyDto, KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { ZSetMember } from 'uiSrc/modules/key-details/components/zset-details/hooks/interface'

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
  loadKeysSuccess: (data: KeysStoreData, isSearched?: boolean, isFiltered?: boolean) => void
  loadMoreKeysSuccess: (data: KeysStoreData) => void

  deleteKey: () => void
  deleteKeyFinal: () => void
  deleteKeyFromTree: (key: RedisString) => void

  editKeyName: (key: RedisString, newKey: RedisString) => void
  // Add key
  addKey: () => void
  addKeyFinal: () => void
  addKeySuccess: (data: KeysStoreData) => void
  addKeyToTree: (key: RedisString, keyType: KeyTypes) => void
  resetAddKey: () => void
  setDatabaseId: (databaseId: string) => void

  setFilterAndSearch: (filter: Nullable<KeyTypes>, search: string) => void
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
  deleteKeyAction: (key: RedisString, onSuccessAction?: (key: RedisString) => void) => void
  addStringKey: (data: SetStringWithExpire, onSuccessAction?: () => void, onFailAction?: () => void) => void
  addSetKey: (data: CreateSetWithExpireDto, onSuccessAction?: () => void, onFailAction?: () => void) => void
  addListKey: (data: CreateListWithExpireDto, onSuccessAction?: () => void, onFailAction?: () => void) => void
  addReJSONKey: (data: CreateRejsonRlWithExpireDto, onSuccessAction?: () => void, onFailAction?: () => void) => void
  addHashKey: (data: CreateHashWithExpireDto, onSuccessAction?: () => void, onFailAction?: () => void) => void
  addZSetKey: (data: CreateZSetWithExpireDto, onSuccessAction?: () => void, onFailAction?: () => void) => void
  addKeyIntoTree: (key: RedisString, keyType: KeyTypes) => void
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

export interface KeyWithExpireDto extends KeyDto {
  expire?: number
}

export interface SetStringWithExpire extends KeyWithExpireDto {
  value: RedisString
}

export interface CreateSetWithExpireDto extends KeyWithExpireDto {
  members: RedisString[]
}

export interface CreateListWithExpireDto extends KeyWithExpireDto {
  element: RedisString
}

export interface HashFieldDto {
  field: RedisString
  value: RedisString
}

export interface CreateHashWithExpireDto extends KeyWithExpireDto {
  fields: HashFieldDto[]
}

export interface CreateZSetWithExpireDto extends KeyWithExpireDto {
  members: ZSetMember[]
}

export interface CreateRejsonRlWithExpireDto extends KeyWithExpireDto {
  data: string
}

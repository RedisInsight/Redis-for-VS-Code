import { KeyTypes } from 'uiSrc/constants'
import { KeyDto, KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { ZSetMember } from 'uiSrc/modules/key-details/components/zset-details/hooks/interface'

export interface CliOutputStore {
  data: (string | JSX.Element)[]
  commandHistory: string[]
  loading: boolean
  error: string
  db: number
}

export interface CliSettingsStore {
  isMinimizedHelper: boolean
  isShowCli: boolean
  isShowHelper: boolean
  cliClientUuid: string
  loading: boolean
  errorClient: string
  matchedCommand: string
  searchedCommand: string
  isSearching: boolean
  isEnteringCommand: boolean
  searchingCommand: string
  searchingCommandFilter: string
  unsupportedCommands: string[]
  blockingCommands: string[]
  activeCliId: string
  cliConnectionsHistory: ConnectionHistory[]
}

export interface ConnectionHistory {
  id: string
  name: string
  cliHistory: any[]
}

export interface CliOutputActions {
  setInitialState: () => void
  sendCliCommand: () => void
  sendCliCommandFailure: (error: string) => void
  sendCliCommandFinal: () => void
  setOutput: (data: any[]) => void
  concatToOutput: (data: any[]) => void
  updateCliCommandHistory: (data: string[]) => void
  resetOutput: () => void
  setCliDbIndex: (db: number) => void
}

export interface CliSettingsActions {
  clearSearchingCommand: () => void
  setMatchedCommand: (data: string) => void
  setCliEnteringCommand: () => void
  setSearchedCommand: (data: string) => void

  processCliClient: () => void
  processCliClientSuccess: (data: string) => void
  processCliClientFinal: () => void
  processCliClientFailure: (errorClient: string) => void

  deleteCliClientSuccess: () => void

  getUnsupportedCommandsSuccess: (data: string[]) => void
  getBlockingCommandsSuccess: (data: string[]) => void

  resetCliClientUuid: () => void
  resetCliSettings: () => void
  goBackFromCommand: () => void

  setActiveCliId: (data: string) => void

  addCliConnectionsHistory: (data: ConnectionHistory) => void
  updateCliConnectionsHistory: (data: ConnectionHistory[]) => void
  removeFromCliConnectionsHistory: (data: ConnectionHistory) => void
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

export interface GetKeysWithDetailsShardResponse extends GetKeysWithDetailsResponse {
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

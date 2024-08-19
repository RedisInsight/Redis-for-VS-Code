import { KeyTypes, KeyValueCompressor, SelectedKeyActionType } from 'uiSrc/constants'
import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { Database } from '../use-databases-store/interface'

export interface SelectedKeyStore {
  loading: boolean
  refreshing: boolean
  refreshDisabled: boolean
  lastRefreshTime: Nullable<number>
  data: Nullable<KeyInfo>
  compressor: Nullable<KeyValueCompressor>
  // for connection between selected key and key trees
  action: Nullable<SelectedKeyAction>
}

interface SelectedKeyAction {
  database: Database
  type: SelectedKeyActionType
  keyInfo: {
    key?: RedisString
    newKey?: RedisString
    keyType?: KeyTypes
  }
}

export interface SelectedKeyActions {
  resetSelectedKeyStore: () => void
  processSelectedKey: () => void
  processSelectedKeyFinal: () => void
  processSelectedKeySuccess: (data: KeyInfo) => void
  refreshSelectedKey: () => void
  refreshSelectedKeyFinal: () => void

  // delete selected key
  // deleteSelectedKey: () => void

  // update selected key
  updateSelectedKeyRefreshTime: (data: number) => void
  setSelectedKeyAction: (data: Nullable<SelectedKeyAction>) => void
  setSelectedKeyRefreshDisabled: (data: boolean) => void
}

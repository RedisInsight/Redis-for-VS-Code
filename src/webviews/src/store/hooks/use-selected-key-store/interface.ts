import { KeyTypes, KeyValueCompressor, KeyValueFormat, SelectedKeyActionType } from 'uiSrc/constants'
import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'

export interface SelectedKeyStore {
  loading: boolean
  refreshing: boolean
  refreshDisabled: boolean
  lastRefreshTime: Nullable<number>
  data: Nullable<KeyInfo>
  viewFormat: KeyValueFormat
  compressor: Nullable<KeyValueCompressor>
  // for connection between selected key and key trees
  action: Nullable<SelectedKeyAction>
}

interface SelectedKeyAction {
  databaseId: string
  key?: RedisString
  newKey?: RedisString
  type: SelectedKeyActionType
  keyType?: KeyTypes
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
  setViewFormat: (data: KeyValueFormat) => void
}

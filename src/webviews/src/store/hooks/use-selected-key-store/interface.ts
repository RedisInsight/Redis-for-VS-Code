import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { KeyInfo, Nullable } from 'uiSrc/interfaces'

export interface SelectedKeyStore {
  loading: boolean
  refreshing: boolean
  lastRefreshTime: Nullable<number>
  data: Nullable<KeyInfo>
  viewFormat: KeyValueFormat
  compressor: Nullable<KeyValueCompressor>
}

export interface SelectedKeyActions {
  resetSelectedKeyStore: () => void
  processSelectedKey: () => void
  processSelectedKeyFinal: () => void
  processSelectedKeySuccess: (data: KeyInfo) => void

  // delete selected key
  // deleteSelectedKey: () => void

  // update selected key
  updateSelectedKeyRefreshTime: (data: number) => void
}

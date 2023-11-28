import { create } from 'zustand'
import { AxiosError } from 'axios'
import { persist } from 'zustand/middleware'
import { commonMiddlewares } from 'uiSrc/store'
import { KeyInfo, RedisString } from 'uiSrc/interfaces'
import { apiService, localStorageService } from 'uiSrc/services'
import {
  ApiEndpoints,
  DEFAULT_VIEW_FORMAT,
  KeyTypes,
  STRING_MAX_LENGTH,
  StorageItem,
} from 'uiSrc/constants'
import { bufferToString, getEncoding, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { fetchString } from 'uiSrc/modules'
import { SelectedKeyActions, SelectedKeyStore } from './interface'

export const initialState: SelectedKeyStore = {
  loading: false,
  refreshing: false,
  lastRefreshTime: null,
  data: null,
  viewFormat: localStorageService?.get(StorageItem.viewFormat) ?? DEFAULT_VIEW_FORMAT,
  compressor: null,
}

export const useSelectedKeyStore = create<SelectedKeyStore & SelectedKeyActions>()(
  commonMiddlewares(persist((set) => ({
    ...initialState,
    // actions
    resetSelectedKeyStore: () => set(initialState),
    processSelectedKey: () => set({ loading: true }),
    processSelectedKeyFinal: () => set({ loading: false }),
    processSelectedKeySuccess: (data: KeyInfo) =>
      set({ data: { ...data, nameString: bufferToString(data.name) } }),
    // delete selected key
    // deleteSelectedKey: () => set({ data: null }),
    // update selected key
    updateSelectedKeyRefreshTime: (lastRefreshTime: number) => set({ lastRefreshTime }),
  }),
  { name: 'selectedKey' })),
)

// Asynchronous thunk action
export const fetchKeyInfo = (key: RedisString) => {
  useSelectedKeyStore.setState(async (state) => {
    state.processSelectedKey()
    try {
      const { data, status } = await apiService.post<KeyInfo>(
        getUrl(ApiEndpoints.KEY_INFO),
        { keyName: key },
        { params: { encoding: getEncoding() } },
      )

      if (isStatusSuccessful(status)) {
        state.processSelectedKeySuccess(data)
        state.updateSelectedKeyRefreshTime(Date.now())

        fetchKeyValueByType(key, data.type)
      }
    } catch (_err) {
      const error = _err as AxiosError
      console.debug({ error })
    } finally {
      state.processSelectedKeyFinal()
    }
  })
}

// Asynchronous thunk action
export function editKeyTTL(
  key: RedisString,
  ttl: number,
  onSuccess?: (ttl: number, prevTTL?: number) => void,
) {
  useSelectedKeyStore.setState(async (state) => {
    state.processSelectedKey()

    try {
      const { status } = await apiService.patch(
        getUrl(ApiEndpoints.KEY_TTL),
        { keyName: key, ttl },
        { params: { encoding: getEncoding() } },
      )
      if (isStatusSuccessful(status)) {
        onSuccess?.(ttl, state.data?.ttl)

        if (ttl !== 0) {
          fetchKeyInfo(key)
        } else {
          // state.deleteSelectedKey()
          // dispatch<any>(deleteKeyFromList(key))
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      console.debug({ error })
    } finally {
      state.processSelectedKeyFinal()
    }
  })
}

export const fetchKeyValueByType = (key: RedisString, type?: KeyTypes) => {
  if (type === KeyTypes.String) {
    fetchString(key, {
      end: STRING_MAX_LENGTH,
    })
  }
  // if (type === KeyTypes.Hash) {
  //   dispatch<any>(fetchHashFields(key, 0, SCAN_COUNT_DEFAULT, '*', resetData))
  // }
  // if (type === KeyTypes.List) {
  //   dispatch<any>(fetchListElements(key, 0, SCAN_COUNT_DEFAULT, resetData))
  // }
  // if (type === KeyTypes.ZSet) {
  //   dispatch<any>(
  //     fetchZSetMembers(key, 0, SCAN_COUNT_DEFAULT, SortOrder.ASC, resetData),
  //   )
  // }
  // if (type === KeyTypes.Set) {
  //   dispatch<any>(fetchSetMembers(key, 0, SCAN_COUNT_DEFAULT, '*', resetData))
  // }
  // if (type === KeyTypes.ReJSON) {
  //   dispatch<any>(fetchReJSON(key, '.', resetData))
  // }
  // if (type === KeyTypes.Stream) {
  //   const { viewType } = state.browser.stream

  //   if (viewType === StreamViewType.Data) {
  //     dispatch<any>(fetchStreamEntries(
  //       key,
  //       SCAN_COUNT_DEFAULT,
  //       SortOrder.DESC,
  //       resetData,
  //     ))
  //   }
  // }
}

import { create } from 'zustand'
import { AxiosError } from 'axios'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { isNull } from 'lodash'
import { KeyInfo, RedisString } from 'uiSrc/interfaces'
import { apiService, localStorageService } from 'uiSrc/services'
import {
  ApiEndpoints,
  DEFAULT_SEARCH_MATCH,
  DEFAULT_VIEW_FORMAT,
  KeyTypes,
  SCAN_COUNT_DEFAULT,
  STRING_MAX_LENGTH,
  SortOrder,
  StorageItem,
} from 'uiSrc/constants'
import { bufferToString, getApiErrorMessage, getEncoding, getUrl, getDatabaseUrl, isStatusSuccessful, showErrorMessage } from 'uiSrc/utils'
import { fetchString } from 'uiSrc/modules'
import { fetchHashFields } from 'uiSrc/modules/key-details/components/hash-details/hooks/useHashStore'
import { fetchZSetMembers } from 'uiSrc/modules/key-details/components/zset-details/hooks/useZSetStore'
import {
  fetchListElements,
  fetchSearchingListElement,
  useListStore,
} from 'uiSrc/modules/key-details/components/list-details/hooks/useListStore'
import { fetchSetMembers } from 'uiSrc/modules/key-details/components/set-details/hooks/useSetStore'
import { SelectedKeyActions, SelectedKeyStore } from './interface'

export const initialSelectedKeyState: SelectedKeyStore = {
  loading: false,
  refreshing: false,
  lastRefreshTime: null,
  data: null,
  viewFormat: localStorageService?.get(StorageItem.viewFormat) ?? DEFAULT_VIEW_FORMAT,
  compressor: null,
  action: null,
}

export const useSelectedKeyStore = create<SelectedKeyStore & SelectedKeyActions>()(
  immer(devtools(persist((set) => ({
    ...initialSelectedKeyState,
    // actions
    resetSelectedKeyStore: () => set(initialSelectedKeyState),
    processSelectedKey: () => set({ loading: true }),
    processSelectedKeyFinal: () => set({ loading: false }),
    processSelectedKeySuccess: (data: KeyInfo) =>
      set({ data: { ...data, nameString: bufferToString(data.name) } }),
    refreshSelectedKey: () => set({ refreshing: true }),
    refreshSelectedKeyFinal: () => set({ refreshing: false }),
    // delete selected key
    // deleteSelectedKey: () => set({ data: null }),
    // update selected key
    updateSelectedKeyRefreshTime: (lastRefreshTime) => set({ lastRefreshTime }),

    setSelectedKeyAction: (action) => set({ action }),
  }),
  {
    name: 'selectedKey',
    storage: createJSONStorage(() => sessionStorage),
  }))),
)

// Asynchronous thunk action
export const fetchKeyInfo = (
  { key, databaseId }: { key: RedisString, databaseId?: string },
  fetchKeyValue = true,
  onSuccess?: () => void,
) => {
  useSelectedKeyStore.setState(async (state) => {
    state.processSelectedKey()
    try {
      const { data, status } = await apiService.post<KeyInfo>(
        databaseId ? getDatabaseUrl(databaseId, ApiEndpoints.KEY_INFO) : getUrl(ApiEndpoints.KEY_INFO),
        { keyName: key },
        { params: { encoding: getEncoding() } },
      )

      if (isStatusSuccessful(status)) {
        onSuccess?.()
        state.processSelectedKeySuccess(data)
        state.updateSelectedKeyRefreshTime(Date.now())

        if (fetchKeyValue) {
          fetchKeyValueByType(key, data.type)
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    } finally {
      state.processSelectedKeyFinal()
    }
  })
}

export const refreshKeyInfo = (key: RedisString, fetchKeyValue = true) => {
  useSelectedKeyStore.setState(async (state) => {
    state.refreshSelectedKey()
    try {
      const { data, status } = await apiService.post<KeyInfo>(
        getUrl(ApiEndpoints.KEY_INFO),
        { keyName: key },
        { params: { encoding: getEncoding() } },
      )

      if (isStatusSuccessful(status)) {
        state.processSelectedKeySuccess(data)
        state.updateSelectedKeyRefreshTime(Date.now())

        if (fetchKeyValue) {
          fetchKeyValueByType(key, data.type)
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    } finally {
      state.refreshSelectedKeyFinal()
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
          fetchKeyInfo({ key })
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
  if (type === KeyTypes.Hash) {
    fetchHashFields(key, 0, SCAN_COUNT_DEFAULT)
  }
  if (type === KeyTypes.ZSet) {
    fetchZSetMembers(key, 0, SCAN_COUNT_DEFAULT, SortOrder.ASC)
  }
  if (type === KeyTypes.List) {
    const index = useListStore.getState().data.searchedIndex || null
    if (!isNull(index)) {
      fetchSearchingListElement(key, index)
    } else {
      fetchListElements(key, 0, SCAN_COUNT_DEFAULT)
    }
  }
  if (type === KeyTypes.Set) {
    fetchSetMembers(key, 0, SCAN_COUNT_DEFAULT, DEFAULT_SEARCH_MATCH)
  }
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

import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, DEFAULT_DELIMITER, StorageItem } from 'uiSrc/constants'
import { getApiErrorMessage, showErrorMessage } from 'uiSrc/utils'
import { RedisResponseEncoding } from 'uiSrc/interfaces'
import {
  AppInfoStore,
  AppInfoActions,
  AppInfoResponses,
  GetAppSettingsResponse,
} from './interface'

export const initialAppInfoState: AppInfoStore = {
  loading: false,
  isShowConceptsPopup: null,
  encoding: RedisResponseEncoding.Buffer,
  config: null,
  spec: null,
  server: null,
  delimiter: DEFAULT_DELIMITER,
}

export const useAppInfoStore = create<AppInfoStore & AppInfoActions>()(
  immer(devtools(persist((set) => ({
    ...initialAppInfoState,
    // localStorage can't be called before initialization
    setInitialState: () => set({
      delimiter: localStorageService?.get(StorageItem.treeViewDelimiter) || DEFAULT_DELIMITER,
    }),

    // actions
    processAppInfo: () => set({ loading: true }),
    processAppInfoFinal: () => set({ loading: false }),
    processAppInfoSuccess: ([server, config, spec]) =>
      set({ server, config, spec }),

    setIsShowConceptsPopup: (isShowConceptsPopup) => set({ isShowConceptsPopup }),

    updateUserConfigSettingsSuccess: (config) => set({
      config,
      isShowConceptsPopup: false,
    }),

    setDelimiter: (delimiter) => set((state) => {
      state.delimiter = delimiter
      localStorageService?.set(StorageItem.treeViewDelimiter, delimiter)
      return state
    }),

  }),
  { name: 'appInfo' }))),
)

// Asynchronous thunk action
export const fetchAppInfo = () => {
  useAppInfoStore.setState(async (state) => {
    state.processAppInfo()
    try {
      const responses = await Promise.all([
        ApiEndpoints.INFO,
        ApiEndpoints.SETTINGS,
        ApiEndpoints.SETTINGS_AGREEMENTS_SPEC,
      ].map((url) => apiService.get(url)))

      state.processAppInfoSuccess(responses.map(({ data }) => data) as AppInfoResponses)
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    } finally {
      state.processAppInfoFinal()
    }
  })
}

// Asynchronous thunk action
export function updateUserConfigSettingsAction(
  settings: any,
  onSuccessAction?: (data: GetAppSettingsResponse) => void,
) {
  useAppInfoStore.setState(async (state) => {
    state.processAppInfo()

    try {
      const { data } = await apiService.patch<GetAppSettingsResponse>(ApiEndpoints.SETTINGS, settings)

      state.updateUserConfigSettingsSuccess(data)
      onSuccessAction?.(data)
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    } finally {
      state.processAppInfoFinal()
    }
  })
}

import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { isString, uniqBy } from 'lodash'

import { apiService, localStorageService, resourcesService } from 'uiSrc/services'
import { ApiEndpoints, DEFAULT_DELIMITER, ICommand, StorageItem } from 'uiSrc/constants'
import { getApiErrorMessage, showErrorMessage } from 'uiSrc/utils'
import { RedisResponseEncoding } from 'uiSrc/interfaces'
import { checkDeprecatedCommandGroup } from 'uiSrc/modules/cli/utils'
import {
  AppInfoStore,
  AppInfoActions,
  AppInfoResponses,
  GetAppSettingsResponse,
  AppResourcesResponses,
} from './interface'

export const initialAppInfoState: AppInfoStore = {
  loading: false,
  isShowConcepts: null,
  encoding: RedisResponseEncoding.Buffer,
  config: null,
  spec: null,
  server: null,
  createDbContent: null,
  delimiters: [DEFAULT_DELIMITER],
  commandsSpec: {},
  commandsArray: [],
  commandGroups: [],
}

export const useAppInfoStore = create<AppInfoStore & AppInfoActions>()(
  immer(devtools((set) => ({
    ...initialAppInfoState,
    // localStorage can't be called before initialization
    setInitialState: () => set({
      delimiters: localStorageService?.get(StorageItem.treeViewDelimiter) || [DEFAULT_DELIMITER],
    }),

    // actions
    processAppInfo: () => set({ loading: true }),
    processAppInfoFinal: () => set({ loading: false }),
    processAppInfoSuccess: (appInfo) => set({ ...appInfo }),

    setIsShowConcepts: (isShowConcepts) => set({ isShowConcepts }),

    updateUserConfigSettingsSuccess: (config) => set({
      config,
      isShowConcepts: false,
    }),

    setDelimiters: (delimiter) => set((state) => {
      state.delimiters = delimiter
      localStorageService?.set(StorageItem.treeViewDelimiter, delimiter)
      return state
    }),

  }))),
)

// Asynchronous thunk action
export const fetchAppInfo = (onSuccess?: (data: Partial<AppInfoStore>) => void) => {
  useAppInfoStore.setState(async (state) => {
    state.processAppInfo()
    try {
      const [server, config, spec, commandsSpec] = (await Promise.all([
        ApiEndpoints.INFO,
        ApiEndpoints.SETTINGS,
        ApiEndpoints.SETTINGS_AGREEMENTS_SPEC,
        ApiEndpoints.REDIS_COMMANDS,
      ].map((url) => apiService.get(url)))).map(({ data }) => data) as AppInfoResponses

      // default resources
      const [createDbContent] = (await Promise.all([
        ApiEndpoints.CONTENT_CREATE_DATABASE,
      ].map((url) => resourcesService.get(url)))).map(({ data }) => data) as AppResourcesResponses

      const appInfo = {
        server,
        config,
        spec,
        createDbContent,
        commandsSpec,
        commandsArray: Object.keys(commandsSpec).sort(),
        commandGroups: uniqBy(Object.values(commandsSpec), 'group')
          .map((item: ICommand) => item.group)
          .filter((group: string) => isString(group))
          .filter((group: string) => !checkDeprecatedCommandGroup(group)),
      }

      state.processAppInfoSuccess(appInfo)
      onSuccess?.(appInfo)
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

export function enableUserAnalyticsAction() {
  useAppInfoStore.setState(async (state) => {
    const agreements = state?.config?.agreements

    if (agreements && !agreements.analytics) {
      updateUserConfigSettingsAction({ agreements: { ...agreements, analytics: true } })
    }
  })
}

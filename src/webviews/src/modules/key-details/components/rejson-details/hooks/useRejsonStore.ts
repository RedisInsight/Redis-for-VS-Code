import { create } from 'zustand'
import axios, { AxiosError, CancelTokenSource } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { isNumber } from 'lodash'

import { refreshKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, successMessages } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  getEncoding,
  getJsonPathLevel,
  getUrl,
  isStatusSuccessful,
  showErrorMessage,
  showInformationMessage,
} from 'uiSrc/utils'
import {
  RejsonActions,
  RejsonState,
  RejsonDataState,
} from './interface'

const JSON_LENGTH_TO_FORCE_RETRIEVE = 200
// eslint-disable-next-line import/no-mutable-exports
export let sourceRejson: Nullable<CancelTokenSource> = null

export const initialState: RejsonState = {
  loading: false,
  error: null,
  data: {
    downloaded: false,
    data: undefined,
    type: '',
  },
}

export const useRejsonStore = create<RejsonState & RejsonActions>()(
  immer(devtools(persist((set) => ({
    ...initialState,
    // actions
    resetRejsonStore: () => set(initialState),
    processRejson: () => set({ loading: true }),
    processRejsonFinal: () => set({ loading: false }),
    processRejsonSuccess: (data) => set({ data }),
  }),
  { name: 'keyRejson' }))),
)

// async actions
export const fetchReJSON = (
  key: RedisString,
  path = '.',
  length?: number,
  onSuccess?: (data: RejsonDataState) => void,
) => useRejsonStore.setState(async (state) => {
  state.resetRejsonStore()
  state.processRejson()

  try {
    sourceRejson?.cancel?.()

    const { CancelToken } = axios
    sourceRejson = CancelToken.source()

    const { data, status } = await apiService.post<RejsonDataState>(
      getUrl(ApiEndpoints.REJSON_GET),
      {
        keyName: key,
        path,
        forceRetrieve: isNumber(length) && length > JSON_LENGTH_TO_FORCE_RETRIEVE,
        encoding: getEncoding(),
      },
      { cancelToken: sourceRejson.token },
    )

    sourceRejson = null
    if (isStatusSuccessful(status)) {
      state.processRejsonSuccess(data)
      useSelectedKeyStore.getState().updateSelectedKeyRefreshTime(Date.now())
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processRejsonFinal()
  }
})

export const setReJSONDataAction = (
  key: RedisString,
  path: string,
  data: string,
  length?: number,
  onSuccessAction?: (keyLevel: string) => void,
) => useRejsonStore.setState(async (state) => {
  state.processRejson()

  try {
    const { status } = await apiService.patch<RejsonDataState>(
      getUrl(ApiEndpoints.REJSON_SET),
      {
        keyName: key,
        path,
        data,
      },
    )

    if (isStatusSuccessful(status)) {
      try {
        onSuccessAction?.(getJsonPathLevel(path))
      } catch (error) {
        // console.log(error)
      }

      fetchReJSON(key, '.', length)
      refreshKeyInfo(key, false)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processRejsonFinal()
  }
})

export const appendReJSONArrayItemAction = (
  key: RedisString,
  path: string,
  data: string,
  length?: number,
  onSuccessAction?: (keyLevel: string) => void,
) => useRejsonStore.setState(async (state) => {
  state.processRejson()

  try {
    const { status } = await apiService.patch<RejsonDataState>(
      getUrl(ApiEndpoints.REJSON_ARRAPPEND),
      {
        keyName: key,
        path,
        data: [data],
      },
    )

    if (isStatusSuccessful(status)) {
      try {
        const keyLevel = path === '.' ? '0' : getJsonPathLevel(`${path}[0]`)

        onSuccessAction?.(keyLevel)
      } catch (error) {
        // console.log(error)
      }

      fetchReJSON(key, '.', length)
      refreshKeyInfo(key, false)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processRejsonFinal()
  }
})

export const removeReJSONKeyAction = (
  key: RedisString,
  path = '.',
  jsonKeyName = '',
  length?: number,
  onSuccessAction?: (keyLevel: string) => void,
) => useRejsonStore.setState(async (state) => {
  state.processRejson()

  try {
    const { status } = await apiService.delete<RejsonDataState>(
      getUrl(ApiEndpoints.REJSON),
      {
        data: {
          keyName: key,
          path,
        },
      },
    )

    if (isStatusSuccessful(status)) {
      try {
        fetchReJSON(key, '.', length)
        refreshKeyInfo(key, false)

        onSuccessAction?.(getJsonPathLevel(path))

        showInformationMessage(
          successMessages.REMOVED_KEY_VALUE(key, jsonKeyName, 'JSON key').message,
        )
      } catch (error) {
        // console.log(error)
      }
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processRejsonFinal()
  }
})

export const fetchVisualisationResults = async (
  key: RedisString,
  path = '.',
  forceRetrieve = false,
) => {
  useRejsonStore.getState().processRejson()

  try {
    const { data, status } = await apiService.post<RejsonDataState>(
      getUrl(ApiEndpoints.REJSON_GET),
      {
        keyName: key,
        path,
        forceRetrieve,
        encoding: getEncoding(),
      },
    )

    if (isStatusSuccessful(status)) {
      return data
    }

    throw new Error(data.toString())
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    return null
  } finally {
    useRejsonStore.getState().processRejsonFinal()
  }
}

import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError, CancelTokenSource } from 'axios'
import { cloneDeep } from 'lodash'

import { AppDispatch, RootState } from 'uiSrc/store'
import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import {
  DEFAULT_SEARCH_MATCH,
  ENDPOINT_BASED_ON_KEY_TYPE,
  EndpointBasedOnKeyType,
  ApiEndpoints,
  KeyTypes,
  successMessages,
} from 'uiSrc/constants'
import {
  TelemetryEvent,
  getApiErrorMessage,
  getMatchType,
  getUrl,
  isStatusSuccessful,
  sendEventTelemetry,
  showInformationMessage,
  showErrorMessage,
} from 'uiSrc/utils'
import { GetKeysWithDetailsResponse, SetStringWithExpire, KeysStore, KeysStoreData } from './interface'
import { parseKeysListResponse } from '../../modules/keys-tree/utils'

export const initialState: KeysStore = {
  loading: false,
  error: '',
  filter: null,
  search: '',
  isSearched: false,
  isFiltered: false,
  data: {
    total: 0,
    scanned: 0,
    nextCursor: '0',
    keys: [],
    shardsMeta: {},
    previousResultCount: 0,
    lastRefreshTime: null,
  },
  selectedKey: {
    loading: false,
    refreshing: false,
    lastRefreshTime: null,
    error: '',
    data: null,
    length: 0,
    compressor: null,
  },
  addKey: {
    loading: false,
    error: '',
  },
}

const keysSlice = createSlice({
  name: 'keys',
  initialState,
  reducers: {
    loadKeys: (state) => {
      state.loading = true
      state.error = ''
    },
    loadKeysSuccess: (state, { payload: { data } }: PayloadAction<{ data: KeysStoreData }>) => {
      state.data = {
        ...data,
        previousResultCount: data.keys?.length,
      }
      state.loading = false
      state.data.lastRefreshTime = Date.now()
    },
    loadKeysFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },

    // load more Keys for infinity scroll
    loadMoreKeys: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreKeysSuccess: (state, {
      payload: { total, scanned, nextCursor, keys, shardsMeta },
    }: PayloadAction<KeysStoreData>) => {
      state.data.keys = state.data.keys.concat(keys)
      state.data.total = total
      state.data.scanned = scanned
      state.data.nextCursor = nextCursor
      state.data.shardsMeta = shardsMeta
      state.data.previousResultCount = keys.length

      state.loading = false
    },
    loadMoreKeysFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },

    // Add Key
    addKey: (state) => {
      state.addKey.loading = true
    },
    addKeySuccess: (state) => {
      state.addKey.loading = false
    },
    updateKeyList: (state, { payload }) => {
      state.data?.keys.unshift({ name: payload.keyName })

      state.data = {
        ...state.data,
        total: (state.data.total || 0) + 1,
        scanned: state.data.scanned + 1,
      }
    },
    addKeyFailure: (state, { payload }) => {
      state.addKey.loading = false
      state.addKey.error = payload
    },
    resetAddKey: (state) => {
      state.addKey = cloneDeep(initialState.addKey)
    },
  },
})

// Actions generated from the slice
export const {
  loadKeys,
  loadKeysSuccess,
  loadKeysFailure,
  loadMoreKeys,
  loadMoreKeysSuccess,
  loadMoreKeysFailure,
  addKey,
  addKeySuccess,
  updateKeyList,
  addKeyFailure,
  resetAddKey,
} = keysSlice.actions

// A selector
export const keysSelector = (state: RootState) => state.browser.keys
export const keysDataSelector = (state: RootState) => state.browser.keys.data
export const selectedKeyDataSelector = (state: RootState) => state.browser.keys.selectedKey.data
export const addKeyStateSelector = (state: RootState) => state.browser.keys.addKey

// The reducer
export default keysSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let sourceKeysFetch: Nullable<CancelTokenSource> = null

// Asynchronous thunk action
export function fetchPatternKeysAction(
  cursor: string,
  count: number,
  telemetryProperties: { [key: string]: any } = {},
  onSuccess?: (data: GetKeysWithDetailsResponse[]) => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadKeys())

    try {
      sourceKeysFetch?.cancel?.()

      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const state = stateInit()
      const { search: match, filter: type } = state.browser.keys
      const { encoding } = state.app.info

      const { data, status } = await apiService.post<GetKeysWithDetailsResponse[]>(
        getUrl(ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        dispatch(
          loadKeysSuccess({
            data: parseKeysListResponse({}, data),
          }),
        )
        let matchValue = '*'
        let event = TelemetryEvent.TREE_VIEW_KEYS_SCANNED
        if (!!type || !!match) {
          if (match !== '*' && !!match) {
            matchValue = getMatchType(match)
          }
          event = TelemetryEvent.TREE_VIEW_KEYS_SCANNED_WITH_FILTER_ENABLED
        }
        sendEventTelemetry({
          event,
          eventData: {
            databaseId: state.connections.databases?.connectedDatabase?.id,
            keyType: type,
            match: matchValue,
            databaseSize: data[0].total,
            numberOfKeysScanned: data[0].scanned,
            scanCount: count,
            source: telemetryProperties.source ?? 'manual',
            ...telemetryProperties,
          },
        })
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(loadKeysFailure(errorMessage))
        onFailed?.()
      }
    }
  }
}

// Asynchronous thunk action
export function fetchMorePatternKeysAction(cursor: string, count: number) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreKeys())

    try {
      sourceKeysFetch?.cancel?.()

      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const state = stateInit()
      const { search: match, filter: type } = state.browser.keys
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        const newKeysData = parseKeysListResponse(
          state.browser.keys.data.shardsMeta,
          data,
        )
        dispatch(loadMoreKeysSuccess(newKeysData))
        sendEventTelemetry({
          event: TelemetryEvent.TREE_VIEW_KEYS_ADDITIONALLY_SCANNED,
          eventData: {
            databaseId: state.connections.databases?.connectedDatabase?.id,
            databaseSize: data[0].total,
            numberOfKeysScanned: state.browser.keys.data.scanned + data[0].scanned,
            scanCount: count,
          },
        })
      }
    } catch (_err) {
      const error = _err as AxiosError
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(loadMoreKeysFailure(errorMessage))
      }
    }
  }
}

// Asynchronous thunk action
export function fetchKeysMetadataTree(
  keys: RedisString[][],
  filter: Nullable<KeyTypes>,
  signal?: AbortSignal,
  onSuccessAction?: (data: KeyInfo[]) => void,
  onFailAction?: () => void,
) {
  return async (_dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { data } = await apiService.post<KeyInfo[]>(
        getUrl(ApiEndpoints.KEYS_METADATA),
        { keys: keys.map(([, nameBuffer]) => nameBuffer), type: filter || undefined },
        { params: { encoding: state.app.info.encoding }, signal },
      )

      const newData = data.map((key, i) => ({ ...key, path: keys[i][0] || 0 })) as KeyInfo[]

      onSuccessAction?.(newData)
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        onFailAction?.()
        console.error(error)
      }
    }
  }
}

function addTypedKey(
  data: any,
  keyType: KeyTypes,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addKey())
    const endpoint = ENDPOINT_BASED_ON_KEY_TYPE[keyType as EndpointBasedOnKeyType]

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.post(
        getUrl(endpoint),
        data,
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(addKeySuccess())
        dispatch<any>(addKeyIntoList({ key: data.keyName, keyType }))
        showInformationMessage(successMessages.ADDED_NEW_KEY(data.keyName).title)
      }
    } catch (error) {
      if (onFailAction) {
        onFailAction()
      }
      const errorMessage = getApiErrorMessage(error as AxiosError)
      // dispatch(addErrorNotification(error))
      dispatch(addKeyFailure(errorMessage))
      showErrorMessage(errorMessage)
    }
  }
}

export function addKeyIntoList({ key, keyType }: { key: RedisString, keyType: KeyTypes }) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { filter, search } = state.browser.keys

    if (search && search !== DEFAULT_SEARCH_MATCH) {
      return null
    }

    if (!filter || filter === keyType) {
      return dispatch(updateKeyList({ keyName: key, keyType }))
    }
    return null
  }
}

// Asynchronous thunk action
export function addStringKey(
  data: SetStringWithExpire,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return addTypedKey(data, KeyTypes.String, onSuccessAction, onFailAction)
}

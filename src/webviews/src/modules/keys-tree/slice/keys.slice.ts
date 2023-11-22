import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError, CancelTokenSource } from 'axios'

import { AppDispatch, RootState } from 'uiSrc/store'
import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { DEFAULT_SEARCH_MATCH, ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import {
  TelemetryEvent,
  getApiErrorMessage,
  getMatchType,
  getUrl,
  isStatusSuccessful,
  sendEventTelemetry,
} from 'uiSrc/utils'
import { GetKeysWithDetailsResponse, KeysStore, KeysStoreData } from './interface'
import { parseKeysListResponse } from '../utils'

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
} = keysSlice.actions

// A selector
export const keysSelector = (state: RootState) => state.browser.keys
export const keysDataSelector = (state: RootState) => state.browser.keys.data
export const selectedKeyDataSelector = (state: RootState) => state.browser.keys.selectedKey.data

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
        { keys: keys.map(([,nameBuffer]) => nameBuffer), type: filter || undefined },
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

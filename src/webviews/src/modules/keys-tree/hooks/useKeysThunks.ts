import axios, { AxiosError, CancelTokenSource } from 'axios'
import { StateCreator } from 'zustand'

import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService, sessionStorageService } from 'uiSrc/services'
import { DEFAULT_SEARCH_MATCH, ApiEndpoints, KeyTypes, successMessages, SCAN_TREE_COUNT_DEFAULT, ENDPOINT_BASED_ON_KEY_TYPE, EndpointBasedOnKeyType, StorageItem } from 'uiSrc/constants'
import {
  TelemetryEvent,
  getApiErrorMessage,
  getDatabaseId,
  getEncoding,
  getMatchType,
  isStatusSuccessful,
  sendEventTelemetry,
  showErrorMessage,
  showInformationMessage,
  getDatabaseUrl,
  getUrl,
  getLengthByKeyType,
} from 'uiSrc/utils'
import { useSelectedKeyStore } from 'uiSrc/store'
import { GetKeysWithDetailsResponse, KeysStore, KeysActions, SetStringWithExpire, KeysThunks, CreateSetWithExpireDto } from './interface'
import { parseKeysListResponse } from '../utils'

// eslint-disable-next-line import/no-mutable-exports
export let sourceKeysFetch: Nullable<CancelTokenSource> = null

export const createKeysThunksSlice: StateCreator<
KeysStore & KeysActions & KeysThunks,
[],
[],
KeysThunks
> = (_, get) => ({
  // actions
  fetchPatternKeysAction: async (
    cursor: string = '0',
    count: number = SCAN_TREE_COUNT_DEFAULT,
    telemetryProperties: { [key: string]: any } = {},
    onSuccess?: (data: GetKeysWithDetailsResponse[]) => void,
    onFailed?: () => void,
  ) => {
    get().loadKeys()

    try {
      sourceKeysFetch?.cancel?.()
      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const { search: match, filter: type, databaseId } = get()

      const { data, status } = await apiService.post<GetKeysWithDetailsResponse[]>(
        getDatabaseUrl(databaseId, ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding: getEncoding() },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        get().loadKeysSuccess(parseKeysListResponse({}, data))
        let matchValue = DEFAULT_SEARCH_MATCH
        let event = TelemetryEvent.TREE_VIEW_KEYS_SCANNED
        if (!!type || !!match) {
          if (match !== DEFAULT_SEARCH_MATCH && !!match) {
            matchValue = getMatchType(match)
          }
          event = TelemetryEvent.TREE_VIEW_KEYS_SCANNED_WITH_FILTER_ENABLED
        }
        sendEventTelemetry({
          event,
          eventData: {
            databaseId: getDatabaseId(),
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
    } catch (error) {
      if (!axios.isCancel(error)) {
        showErrorMessage(getApiErrorMessage(error as AxiosError))
        onFailed?.()
      }
    } finally {
      get().loadKeysFinal()
    }
  },

  // Asynchronous thunk action
  fetchMorePatternKeysAction: async (cursor: string, count: number = SCAN_TREE_COUNT_DEFAULT) => {
    get().loadKeys()

    try {
      sourceKeysFetch?.cancel?.()

      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const { search: match, filter: type, databaseId } = get()
      const { data, status } = await apiService.post(
        getDatabaseUrl(databaseId, ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding: getEncoding() },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        const newKeysData = parseKeysListResponse(
          get().data.shardsMeta,
          data,
        )
        get().loadMoreKeysSuccess(newKeysData)
        sendEventTelemetry({
          event: TelemetryEvent.TREE_VIEW_KEYS_ADDITIONALLY_SCANNED,
          eventData: {
            databaseId: getDatabaseId(),
            databaseSize: data[0].total,
            numberOfKeysScanned: get().data.scanned + data[0].scanned,
            scanCount: count,
          },
        })
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        showErrorMessage(getApiErrorMessage(error as AxiosError))
      }
    } finally {
      get().loadKeysFinal()
    }
  },

  // Asynchronous thunk action
  fetchKeysMetadataTree: async (
    keys: RedisString[][],
    filter: Nullable<KeyTypes>,
    signal?: AbortSignal,
    onSuccessAction?: (data: KeyInfo[]) => void,
    onFailAction?: () => void,
  ) => {
    try {
      const { data } = await apiService.post<KeyInfo[]>(
        getDatabaseUrl(get().databaseId, ApiEndpoints.KEYS_METADATA),
        { keys: keys.map(([,nameBuffer]) => nameBuffer), type: filter || undefined },
        { params: { encoding: getEncoding() }, signal },
      )

      const newData = data.map((key, i) => ({ ...key, path: keys[i][0] || 0 })) as KeyInfo[]

      onSuccessAction?.(newData)
    } catch (error) {
      if (!axios.isCancel(error)) {
        onFailAction?.()
        console.error(error as AxiosError)
      }
    }
  },

  // Asynchronous thunk action
  deleteKeyAction: async (
    key: RedisString,
    onSuccessAction?: () => void,
  ) => {
    get().deleteKey()
    try {
      const { status } = await apiService.delete(
        getDatabaseUrl(get().databaseId, ApiEndpoints.KEYS),
        {
          data: { keyNames: [key] },
          params: { encoding: getEncoding() },
        },
      )

      if (isStatusSuccessful(status)) {
        get().deleteKeyFromTree(key)
        showInformationMessage(successMessages.DELETED_KEY(key).title)
        onSuccessAction?.()
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    } finally {
      get()?.deleteKeyFinal()
    }
  },

  // Asynchronous thunk action
  addStringKey: async (
    data: SetStringWithExpire,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) => get().addTypedKey(data, KeyTypes.String, onSuccessAction, onFailAction),

  // Asynchronous thunk action
  addSetKey: async (
    data: CreateSetWithExpireDto,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) => get().addTypedKey(data, KeyTypes.Set, onSuccessAction, onFailAction),

  addTypedKey: async (
    data: any,
    keyType: KeyTypes,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) => {
    get().addKey()
    const endpoint = ENDPOINT_BASED_ON_KEY_TYPE[keyType as EndpointBasedOnKeyType]

    try {
      const { status } = await apiService.post(
        getUrl(endpoint),
        data,
      )
      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: TelemetryEvent.TREE_VIEW_KEY_ADDED,
          eventData: {
            keyType,
            TTL: data.expire || -1,
            databaseId: sessionStorageService.get(StorageItem.databaseId),
            length: getLengthByKeyType(keyType, data),
          },
        })
        showInformationMessage(successMessages.ADDED_NEW_KEY(data.keyName).title)
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      showErrorMessage(errorMessage)
      onFailAction?.()
    } finally {
      get().addKeyFinal()
    }
  },

  addKeyIntoTree: (key, keyType) => {
    const { filter, search } = get()

    if (search && search !== DEFAULT_SEARCH_MATCH) {
      return
    }

    if (!filter || filter === keyType) {
      get().addKeyToTree(key, keyType)
      useSelectedKeyStore.getState().setSelectedKeyAction(null)
    }
  },
})

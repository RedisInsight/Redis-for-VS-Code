import axios, { AxiosError, CancelTokenSource } from 'axios'
import { StateCreator } from 'zustand'

import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService, sessionStorageService } from 'uiSrc/services'
import { DEFAULT_SEARCH_MATCH, ApiEndpoints, KeyTypes, successMessages, SCAN_TREE_COUNT_DEFAULT, ENDPOINT_BASED_ON_KEY_TYPE, EndpointBasedOnKeyType, StorageItem, CustomHeaders } from 'uiSrc/constants'
import {
  TelemetryEvent,
  getApiErrorMessage,
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
import { GetKeysWithDetailsResponse, KeysStore, KeysActions, SetStringWithExpire, KeysThunks, CreateSetWithExpireDto, CreateListWithExpireDto, CreateHashWithExpireDto, CreateZSetWithExpireDto, CreateRejsonRlWithExpireDto } from './interface'
import { parseKeysListResponse } from '../utils'

// eslint-disable-next-line import/no-mutable-exports
export const sourceKeysFetchStack: Record<string, Nullable<CancelTokenSource>> = {}

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
    telemetryProperties: Record<string, any> = {},
    onSuccess?: (data: GetKeysWithDetailsResponse[]) => void,
    onFailed?: () => void,
  ) => {
    get().loadKeys()

    try {
      const { CancelToken } = axios
      const { search: match, filter: type, databaseId, databaseIndex } = get()
      const sourceKeysFetchKey = databaseId! + databaseIndex!

      sourceKeysFetchStack[sourceKeysFetchKey]?.cancel?.()
      sourceKeysFetchStack[sourceKeysFetchKey] = CancelToken.source()

      const { data, status } = await apiService.post<GetKeysWithDetailsResponse[]>(
        getDatabaseUrl(databaseId, ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          headers: { [CustomHeaders.DbIndex]: databaseIndex },
          cancelToken: sourceKeysFetchStack[sourceKeysFetchKey]?.token,
        },
      )

      sourceKeysFetchStack[sourceKeysFetchKey] = null
      if (isStatusSuccessful(status)) {
        get().loadKeysSuccess(
          parseKeysListResponse({}, data),
          !!match,
          !!type,
        )

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
            databaseId: get()?.databaseId,
            keyType: type,
            match: matchValue,
            databaseSize: data[0]?.total,
            numberOfKeysScanned: data[0]?.scanned,
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
      const { CancelToken } = axios
      const { search: match, filter: type, databaseId, databaseIndex } = get()
      const sourceKeysFetchKey = databaseId! + databaseIndex!
      sourceKeysFetchStack[sourceKeysFetchKey]?.cancel?.()

      sourceKeysFetchStack[sourceKeysFetchKey] = CancelToken.source()

      const { data, status } = await apiService.post(
        getDatabaseUrl(databaseId, ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          headers: { [CustomHeaders.DbIndex]: databaseIndex },
          cancelToken: sourceKeysFetchStack[sourceKeysFetchKey]?.token,
        },
      )

      sourceKeysFetchStack[sourceKeysFetchKey] = null
      if (isStatusSuccessful(status)) {
        const newKeysData = parseKeysListResponse(
          get().data.shardsMeta,
          data,
        )
        get().loadMoreKeysSuccess(newKeysData)
        sendEventTelemetry({
          event: TelemetryEvent.TREE_VIEW_KEYS_ADDITIONALLY_SCANNED,
          eventData: {
            databaseId: get().databaseId,
            databaseSize: data[0]?.total,
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
    signal?: AbortSignal,
    onSuccessAction?: (data: KeyInfo[]) => void,
    onFailAction?: () => void,
  ) => {
    try {
      const { data } = await apiService.post<KeyInfo[]>(
        getDatabaseUrl(get().databaseId, ApiEndpoints.KEYS_METADATA),
        { keys: keys.map(([,nameBuffer]) => nameBuffer), type: get().filter || undefined },
        {
          headers: { [CustomHeaders.DbIndex]: get().databaseIndex }, signal,
        },
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
    onSuccessAction?: (key: RedisString) => void,
  ) => {
    get().deleteKey()
    try {
      const { status } = await apiService.delete(
        getDatabaseUrl(get().databaseId, ApiEndpoints.KEYS),
        {
          data: { keyNames: [key] },
          headers: { [CustomHeaders.DbIndex]: get().databaseIndex },
        },
      )

      if (isStatusSuccessful(status)) {
        get().deleteKeyFromTree(key)
        showInformationMessage(successMessages.DELETED_KEY(key).title)
        onSuccessAction?.(key)
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

  addListKey: async (
    data: CreateListWithExpireDto,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) => get().addTypedKey(data, KeyTypes.List, onSuccessAction, onFailAction),

  addReJSONKey: async (
    data: CreateRejsonRlWithExpireDto,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) => get().addTypedKey(data, KeyTypes.ReJSON, onSuccessAction, onFailAction),

  addHashKey: async (
    data: CreateHashWithExpireDto,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) => get().addTypedKey(data, KeyTypes.Hash, onSuccessAction, onFailAction),

  addZSetKey: async (
    data: CreateZSetWithExpireDto,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) => get().addTypedKey(data, KeyTypes.ZSet, onSuccessAction, onFailAction),

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
            databaseId: window.ri?.database?.id ?? null,
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
      useSelectedKeyStore.getState?.().setSelectedKeyAction(null)
    }
  },
})

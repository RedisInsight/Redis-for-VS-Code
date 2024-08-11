import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import * as l10n from '@vscode/l10n'
import { immer } from 'zustand/middleware/immer'
import { cloneDeep, findIndex, map, remove } from 'lodash'

import { fetchKeyInfo, refreshKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, DEFAULT_SEARCH_MATCH, successMessages } from 'uiSrc/constants'
import {
  bufferToString,
  getApiErrorMessage,
  getEncoding,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  showErrorMessage,
  showInformationMessage,
} from 'uiSrc/utils'
import { AddFieldsToHashDto, GetHashFieldsResponse, HashActions, HashState } from './interface'

export const initialState: HashState = {
  loading: false,
  data: {
    total: 0,
    keyName: '',
    fields: [],
    nextCursor: 0,
    match: DEFAULT_SEARCH_MATCH,
  },
  updateValue: {
    loading: false,
  },
}

export const useHashStore = create<HashState & HashActions>()(
  immer(devtools(persist((set) => ({
    ...initialState,
    // actions
    resetHashStore: () => set(initialState),
    processHash: () => set({ loading: true }),
    processHashFinal: () => set({ loading: false }),
    processHashSuccess: (data, match) => set({ data: { ...data, match } }),
    processHashMoreSuccess: ({ fields, ...rest }, match) => set((state) => ({
      data: {
        ...rest,
        match,
        fields: state.data.fields.concat(fields),
      },
    })),
    removeFields: (fields) => set((state) => {
      remove(state.data?.fields, ({ field }) =>
        fields.findIndex((item) => isEqualBuffers(item, field)) > -1)

      state.data.total -= 1
    }),
    updateFields: ({ fields }) => set((state) => {
      const newFields = map(state.data.fields, (listItem) => {
        const index = findIndex(fields, (item) => isEqualBuffers(item.field, listItem.field))

        if (index > -1) {
          return ({
            ...listItem,
            ...fields[index],
          })
        }

        return listItem
      })

      state.data.fields = newFields
    }),
    resetUpdateValue: () => set((state) => {
      state.updateValue = cloneDeep(initialState.updateValue)
    }),

  }),
  { name: 'keyHash' }))),
)

// async actions
export const fetchHashFields = (
  key: RedisString,
  cursor: number,
  count: number,
  matchInit?: string,
  onSuccess?: (data: GetHashFieldsResponse) => void,
) => useHashStore.setState(async (state) => {
  state.processHash()
  const match = matchInit || state.data.match

  try {
    const { data, status } = await apiService.post<GetHashFieldsResponse>(
      getUrl(ApiEndpoints.HASH_GET_FIELDS),
      {
        keyName: key,
        cursor,
        count,
        match,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processHashSuccess(data, match)
      useSelectedKeyStore.getState().updateSelectedKeyRefreshTime(Date.now())
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processHashFinal()
  }
})

// async actions
export const fetchHashMoreFields = (
  key: RedisString,
  cursor: number,
  count: number,
  match: string,
  onSuccess?: (data: GetHashFieldsResponse) => void,
) => useHashStore.setState(async (state) => {
  state.processHash()

  try {
    const { data, status } = await apiService.post<GetHashFieldsResponse>(
      getUrl(ApiEndpoints.HASH_GET_FIELDS),
      {
        keyName: key,
        cursor,
        count,
        match,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processHashMoreSuccess(data, match)
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processHashFinal()
  }
})
// async actions
export const deleteHashFields = (
  key?: RedisString,
  fields?: RedisString[],
  onSuccess?: (newTotal: number) => void,
) => useHashStore.setState(async (state) => {
  state.processHash()

  try {
    const { data, status } = await apiService.delete(
      getUrl(ApiEndpoints.HASH_FIELDS),
      {
        data: { keyName: key, fields },
        params: { encoding: getEncoding() },
      },
    )

    if (isStatusSuccessful(status)) {
      state.removeFields(fields!)
      const newTotalValue = state.data.total - data.affected
      if (newTotalValue > 0) {
        showInformationMessage(
          successMessages.REMOVED_KEY_VALUE(
            key!,
            fields?.map((field) => bufferToString(field)).join('')!,
            l10n.t('Field'),
          ).message,
        )
        fetchKeyInfo({ key: key! }, false)
      } else {
        showInformationMessage(successMessages.DELETED_KEY(key!).title)
      }
      onSuccess?.(newTotalValue)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processHashFinal()
  }
})

export const updateHashFieldsAction = (
  data: AddFieldsToHashDto,
  fetchKeyValue: boolean = false,
  onSuccess?: () => void,
  onFail?: () => void,
) => useHashStore.setState(async (state) => {
  state.processHash()

  try {
    const { status } = await apiService.put(
      getUrl(ApiEndpoints.HASH),
      data,
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.updateFields(data)
      onSuccess?.()
      refreshKeyInfo(data.keyName, fetchKeyValue)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    onFail?.()
  } finally {
    state.processHashFinal()
  }
})

export const updateHashTTLAction = (
  data: AddFieldsToHashDto,
  fetchKeyValue: boolean = false,
  onSuccess?: (keyRemoved: boolean) => void,
  onFail?: () => void,
) => useHashStore.setState(async (state) => {
  state.processHash()

  try {
    const { status } = await apiService.patch(
      getUrl(ApiEndpoints.HASH_TTL),
      data,
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      const key = data.keyName
      const isLastFieldAffected = state.data.total - data.fields.length === 0
      const isSetToZero = data.fields.reduce((prev, current) => prev + current.expire!, 0) === 0
      const isKeyRemoved = isLastFieldAffected && isSetToZero

      if (isKeyRemoved) {
        showInformationMessage(successMessages.DELETED_KEY(key).title)
        onSuccess?.(isKeyRemoved)
        return
      }

      if (isSetToZero) {
        state.removeFields(data.fields.map(({ field }) => field))
        return
      }

      state.updateFields(data)
      onSuccess?.(isKeyRemoved)
      refreshKeyInfo(data.keyName, fetchKeyValue)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    onFail?.()
  } finally {
    state.processHashFinal()
  }
})

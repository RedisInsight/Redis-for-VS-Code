import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import * as l10n from '@vscode/l10n'
import { immer } from 'zustand/middleware/immer'
import { find, map, remove } from 'lodash'

import { fetchKeyInfo, refreshKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, DEFAULT_SEARCH_MATCH, SortOrder, successMessages } from 'uiSrc/constants'
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
import { AddMembersToZSetDto, GetZSetMembersResponse, ZSetActions, ZSetState } from './interface'

export const initialState: ZSetState = {
  loading: false,
  searching: false,
  data: {
    total: 0,
    keyName: '',
    members: [],
    nextCursor: 0,
    match: DEFAULT_SEARCH_MATCH,
  },
  updateValue: {
    loading: false,
  },
}

export const useZSetStore = create<ZSetState & ZSetActions>()(
  immer(devtools(persist((set) => ({
    ...initialState,
    // actions
    resetZSetStore: () => set(initialState),
    resetZSetMembersStore: () => set((state) => ({ data: { ...state.data, members: [] } })),
    processZSet: () => set({ loading: true }),
    processZSetFinal: () => set({ loading: false }),
    processZSetSuccess: (data, match) => set({ data: { ...data, match } }),
    processZSetMoreSuccess: ({ members, ...rest }, match) => set((state) => ({
      data: {
        ...rest,
        match,
        members: state.data.members.concat(members),
      },
    })),
    removeMembers: (members) => set((state) => {
      state.data.total -= 1

      remove(state.data.members, ({ name }) =>
        members.findIndex((item) => isEqualBuffers(item, name)) > -1)
    }),
    updateMembers: ({ members }) => set((state) => {
      const newMembers = map(state.data.members, (listItem) => {
        const foundField = find(members, (item) => isEqualBuffers(item.name, listItem.name))
        return foundField || listItem
      })

      state.data.members = newMembers
    }),

  }),
  { name: 'keyZSet' }))),
)

// async actions
export const fetchZSetMembers = (
  key: RedisString,
  offset: number,
  count: number,
  sortOrder: SortOrder,
  matchInit?: string,
  onSuccess?: (data: GetZSetMembersResponse) => void,
) => useZSetStore.setState(async (state) => {
  state.processZSet()
  const match = matchInit || state.data.match

  try {
    const { data, status } = await apiService.post<GetZSetMembersResponse>(
      getUrl(match === DEFAULT_SEARCH_MATCH ? ApiEndpoints.ZSET_GET_MEMBERS : ApiEndpoints.ZSET_MEMBERS_SEARCH),
      {
        keyName: key,
        offset: match === DEFAULT_SEARCH_MATCH ? offset : undefined,
        cursor: match !== DEFAULT_SEARCH_MATCH ? offset : undefined,
        count,
        sortOrder,
        match,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processZSetSuccess(data, match)
      useSelectedKeyStore.getState().updateSelectedKeyRefreshTime(Date.now())
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processZSetFinal()
  }
})

// async actions
export const fetchZSetMoreMembers = (
  key: RedisString,
  offset: number,
  count: number,
  sortOrder: SortOrder,
  match: string,
  onSuccess?: (data: GetZSetMembersResponse) => void,
) => useZSetStore.setState(async (state) => {
  state.processZSet()

  try {
    const { data, status } = await apiService.post<GetZSetMembersResponse>(
      getUrl(match === DEFAULT_SEARCH_MATCH ? ApiEndpoints.ZSET_GET_MEMBERS : ApiEndpoints.ZSET_MEMBERS_SEARCH),
      {
        keyName: key,
        offset: match === DEFAULT_SEARCH_MATCH ? offset : undefined,
        cursor: match !== DEFAULT_SEARCH_MATCH ? offset : undefined,
        count,
        sortOrder,
        match,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processZSetMoreSuccess(data, match)
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processZSetFinal()
  }
})
// async actions
export const deleteZSetMembers = (
  key?: RedisString,
  members?: RedisString[],
  onSuccess?: (newTotal: number) => void,
) => useZSetStore.setState(async (state) => {
  state.processZSet()

  try {
    const { data, status } = await apiService.delete(
      getUrl(ApiEndpoints.ZSET_MEMBERS),
      {
        data: { keyName: key, members },
        params: { encoding: getEncoding() },
      },
    )

    if (isStatusSuccessful(status)) {
      state.removeMembers(members!)
      const newTotalValue = state.data.total - data.affected
      if (newTotalValue > 0) {
        showInformationMessage(
          successMessages.REMOVED_KEY_VALUE(
            key!,
            members?.map((members) => bufferToString(members)).join('')!,
            l10n.t('Member'),
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
    state.processZSetFinal()
  }
})

export const updateZSetMembersAction = (
  data: AddMembersToZSetDto,
  onSuccess?: () => void,
  onFail?: () => void,
) => useZSetStore.setState(async (state) => {
  state.processZSet()

  try {
    const { status } = await apiService.put(
      getUrl(ApiEndpoints.ZSET),
      data,
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      onSuccess?.()
      state.updateMembers(data)
      refreshKeyInfo(data.keyName, false)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    onFail?.()
  } finally {
    state.processZSetFinal()
  }
})

export const addZSetMembersAction = (
  data: AddMembersToZSetDto,
  onSuccess?: () => void,
  onFail?: () => void,
) => useZSetStore.setState(async (state) => {
  state.processZSet()

  try {
    const { status } = await apiService.put(
      getUrl(ApiEndpoints.ZSET),
      data,
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      onSuccess?.()
      refreshKeyInfo(data.keyName)
    }
  } catch (_err) {
    const error = _err as AxiosError
    const errorMessage = getApiErrorMessage(error)
    showErrorMessage(errorMessage)
    onFail?.()
  } finally {
    state.processZSetFinal()
  }
})

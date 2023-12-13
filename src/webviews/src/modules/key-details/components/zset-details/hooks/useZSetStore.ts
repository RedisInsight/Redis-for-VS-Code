import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import * as l10n from '@vscode/l10n'
import { immer } from 'zustand/middleware/immer'
import { find, map, remove } from 'lodash'

import { fetchKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, DEFAULT_SEARCH_MATCH, SortOrder, successMessages } from 'uiSrc/constants'
import {
  bufferToString,
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
    processZSet: () => set({ loading: true }),
    processZSetFinal: () => set({ loading: false }),
    processZSetSuccess: (data) => set({ data }),
    processZSetMoreSuccess: ({ members, ...rest }) => set((state) => ({
      data: {
        ...rest,
        members: state.data.members.concat(members),
      },
    })),
    removeMembers: (members) => set((state) => {
      state.data.total - 1

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
      state.processZSetSuccess(data)
      useSelectedKeyStore.getState().updateSelectedKeyRefreshTime(Date.now())
      onSuccess?.(data)
    }
  } catch (_err) {
    const error = _err as AxiosError
    showErrorMessage(error.message)
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
        offset,
        count,
        sortOrder,
        match,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processZSetMoreSuccess(data)
      onSuccess?.(data)
    }
  } catch (_err) {
    const error = _err as AxiosError
    showErrorMessage(error.message)
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
      onSuccess?.(data)
      state.removeMembers(members!)
      const newTotalValue = state.data.total - data.affected
      if (newTotalValue > 0) {
        showInformationMessage(
          successMessages.REMOVED_KEY_VALUE(
            key!,
            members?.map((members) => bufferToString(members)).join('')!,
            l10n.t('Member'),
          ).title,
        )
        fetchKeyInfo(key!, false)
      } else {
      // todo: connection between webviews
      // dispatch(deleteSelectedKeySuccess())
      // dispatch(deleteKeyFromList(key))
        showInformationMessage(successMessages.DELETED_KEY(key!).title)
      }
    }
  } catch (_err) {
    const error = _err as AxiosError
    showErrorMessage(error.message)
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
      fetchKeyInfo(data.keyName, false)
    }
  } catch (_err) {
    const error = _err as AxiosError
    showErrorMessage(error.message)
    onFail?.()
  } finally {
    state.processZSetFinal()
  }
})

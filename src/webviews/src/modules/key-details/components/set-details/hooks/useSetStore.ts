import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import { remove } from 'lodash'
import * as l10n from '@vscode/l10n'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints, DEFAULT_SEARCH_MATCH, successMessages } from 'uiSrc/constants'
import {
  bufferToString,
  getApiErrorMessage,
  getEncoding, getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  showErrorMessage,
  showInformationMessage,
} from 'uiSrc/utils'
import { fetchKeyInfo, refreshKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { RedisString } from 'uiSrc/interfaces'

import {
  GetSetMembersResponse,
  SetState,
  SetActions,
  AddMembersToSetDto,
} from './interface'

export const initialState: SetState = {
  loading: false,
  data: {
    total: 0,
    key: undefined,
    keyName: '',
    members: [],
    nextCursor: 0,
    match: DEFAULT_SEARCH_MATCH,
  },
}

export const useSetStore = create<SetState & SetActions>()(
  immer(devtools(persist((set) => ({
    ...initialState,
    // actions
    processSet: () => set(() => ({ loading: true })),
    processSetFinal: () => set(() => ({ loading: false })),
    loadSetMembersSuccess: (data) => set((state) => ({
      data: {
        ...state.data,
        ...data,
        loading: false,
        key: data.keyName,
      },
    })),
    loadMoreSetMembersSuccess: ({ members, ...rest }) => set((state) => ({
      loading: false,
      data: {
        ...rest,
        members: state.data.members.concat(members),
      },
    })),
    removeMembersFromList: (members) => set((state) => {
      state.data.total -= 1

      remove(state.data.members, (member) =>
        members.findIndex((item) => isEqualBuffers(item, member)) > -1)
    }),
  }),
  { name: 'keySet' }))),
)

// Async action
export const fetchSetMembers = (
  key: RedisString,
  cursor: number,
  count: number,
  match: string,
  onSuccess?: (data: GetSetMembersResponse) => void,
) => useSetStore.setState(async (state) => {
  state.processSet()

  try {
    const { data, status } = await apiService.post<GetSetMembersResponse>(
      getUrl(ApiEndpoints.SET_GET_MEMBERS),
      {
        keyName: key,
        cursor,
        count,
        match,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.loadSetMembersSuccess(data)
      useSelectedKeyStore.getState().updateSelectedKeyRefreshTime(Date.now())
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processSetFinal()
  }
})

// Async action
export const fetchMoreSetMembers = (
  key: RedisString,
  cursor: number,
  count: number,
  match: string,
) => useSetStore.setState(async (state) => {
  state.processSet()

  try {
    const { data, status } = await apiService.post<GetSetMembersResponse>(
      getUrl(ApiEndpoints.SET_GET_MEMBERS),
      {
        keyName: key,
        cursor,
        count,
        match,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.loadMoreSetMembersSuccess(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processSetFinal()
  }
})

// Asynchronous thunk actions
export const deleteSetMembers = (
  key: RedisString,
  members: RedisString[],
  onSuccessAction?: (newTotal: number) => void,
) => useSetStore.setState(async (state) => {
  state.processSet()

  try {
    const { data, status } = await apiService.delete(
      getUrl(ApiEndpoints.SET_MEMBERS),
      {
        data: {
          keyName: key,
          members,
        },
        params: { encoding: getEncoding() },
      },
    )

    if (isStatusSuccessful(status)) {
      const newTotalValue = state.data.total - data.affected
      state.removeMembersFromList(members)
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
      onSuccessAction?.(newTotalValue)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processSetFinal()
  }
})

export const addSetMembersAction = (
  data: AddMembersToSetDto,
  onSuccess?: () => void,
  onFail?: () => void,
) => useSetStore.setState(async (state) => {
  state.processSet()

  try {
    const { status } = await apiService.put(
      getUrl(ApiEndpoints.SET),
      data,
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      onSuccess?.()
      refreshKeyInfo(data.keyName)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    onFail?.()
  } finally {
    state.processSetFinal()
  }
})

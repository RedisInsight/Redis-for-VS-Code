import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { refreshKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, successMessages } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  getEncoding,
  getUrl,
  isStatusSuccessful,
  showErrorMessage,
  showInformationMessage,
} from 'uiSrc/utils'
import {
  SetListElementDto,
  GetListElementsResponse,
  ListActions,
  ListState,
  SearchListElementResponse,
  DeleteListElementsDto,
  PushElementToListDto,
  DeleteListElementsResponse,
} from './interface'

export const initialState: ListState = {
  loading: false,
  data: {
    total: 0,
    keyName: '',
    elements: [],
    searchedIndex: null,
  },
  updateValue: {
    loading: false,
  },
}

export const useListStore = create<ListState & ListActions>()(
  immer(devtools(persist((set) => ({
    ...initialState,
    // actions
    resetListStore: () => set(initialState),
    processList: () => set({ loading: true }),
    processListFinal: () => set({ loading: false }),
    processListSuccess: (data) => set((state) => ({
      data: {
        ...state.data,
        ...data,
        searchedIndex: null,
        elements: data.elements.map((element, i) => ({ index: i, element })),
      },
    })),
    processListMoreSuccess: ({ elements, ...rest }) => set((state) => ({
      data: {
        ...rest,
        elements: state.data.elements.concat(elements.map((element, i) => ({ index: i + state.data.elements.length, element }))),
      },
    })),

    processSearchListElement: (element) => set((state) => ({
      data: {
        ...state.data,
        elements: element ? [element] : [],
        searchedIndex: element ? element.index : state.data.searchedIndex,
      },
    })),

    updateElementInList: (element: SetListElementDto) => set((state) => {
      state.data.elements[state.data.elements.length === 1 ? 0 : element.index] = element
    }),

  }),
  { name: 'keyList' }))),
)

// async actions
export const fetchListElements = (
  key: RedisString,
  offset: number,
  count: number,
  onSuccess?: (data: GetListElementsResponse) => void,
) => useListStore.setState(async (state) => {
  state.processList()

  try {
    const { data, status } = await apiService.post<GetListElementsResponse>(
      getUrl(ApiEndpoints.LIST_GET_ELEMENTS),
      {
        keyName: key,
        offset,
        count,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processListSuccess(data)
      useSelectedKeyStore.getState().updateSelectedKeyRefreshTime(Date.now())
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processListFinal()
  }
})

// async actions
export const fetchListMoreElements = (
  key: RedisString,
  offset: number,
  count: number,
  onSuccess?: (data: GetListElementsResponse) => void,
) => useListStore.setState(async (state) => {
  state.processList()

  try {
    const { data, status } = await apiService.post<GetListElementsResponse>(
      getUrl(ApiEndpoints.LIST_GET_ELEMENTS),
      {
        keyName: key,
        offset,
        count,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processListMoreSuccess(data)
      onSuccess?.(data)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
  } finally {
    state.processListFinal()
  }
})

// async actions
export const fetchSearchingListElement = (
  key: RedisString,
  index: Nullable<number>,
  onSuccess?: (data: RedisString) => void,
) => useListStore.setState(async (state) => {
  state.processList()

  try {
    const { data, status } = await apiService.post<SearchListElementResponse>(
      getUrl(`${ApiEndpoints.LIST_GET_ELEMENTS}/${index}`),
      {
        keyName: key,
      },
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      state.processSearchListElement({ element: data?.value, index: index || 0 })
      useSelectedKeyStore.getState().updateSelectedKeyRefreshTime(Date.now())
      onSuccess?.(data.value)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    state.processSearchListElement()
  } finally {
    state.processListFinal()
  }
})

export const updateListElementsAction = (
  data: SetListElementDto,
  onSuccess?: () => void,
  onFail?: () => void,
) => useListStore.setState(async (state) => {
  state.processList()

  try {
    const { status } = await apiService.patch(
      getUrl(ApiEndpoints.LIST),
      data,
      { params: { encoding: getEncoding() } },
    )

    if (isStatusSuccessful(status)) {
      onSuccess?.()
      state.updateElementInList(data)
      refreshKeyInfo(data.keyName, false)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    onFail?.()
  } finally {
    state.processListFinal()
  }
})

// Asynchronous thunk action
export const insertListElementsAction = (
  data: PushElementToListDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) => useListStore.setState(async (state) => {
  state.processList()
  try {
    const { status } = await apiService.put<PushElementToListDto>(
      getUrl(ApiEndpoints.LIST),
      data,
      { params: { encoding: getEncoding() } },
    )
    if (isStatusSuccessful(status)) {
      onSuccessAction?.()
      refreshKeyInfo(data.keyName, true)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    onFailAction?.()
  } finally {
    state.processListFinal()
  }
})

// Asynchronous thunk action
export const deleteListElementsAction = (
  data: DeleteListElementsDto,
  onSuccessAction?: (newTotal: number) => void,
  onFailAction?: () => void,
) => useListStore.setState(async (state) => {
  state.processList()
  try {
    const { keyName: key } = data
    const { status, data: responseData } = await apiService.delete<DeleteListElementsResponse>(
      getUrl(ApiEndpoints.LIST_DELETE_ELEMENTS),
      { data, params: { encoding: getEncoding() } },
    )
    if (isStatusSuccessful(status)) {
      const newTotal = state.data.total - data.count

      if (newTotal > 0) {
        showInformationMessage(
          successMessages.REMOVED_LIST_ELEMENTS(
            data.keyName,
            data.count,
            responseData.elements,
          ).title,
        )
        refreshKeyInfo(key, true)
      } else {
        showInformationMessage(successMessages.DELETED_KEY(key!).title)
      }
      onSuccessAction?.(newTotal)
    }
  } catch (error) {
    showErrorMessage(getApiErrorMessage(error as AxiosError))
    onFailAction?.()
  } finally {
    state.processListFinal()
  }
})

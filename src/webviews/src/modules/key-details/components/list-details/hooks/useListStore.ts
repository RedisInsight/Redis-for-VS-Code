import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { refreshKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  getEncoding,
  getUrl,
  isStatusSuccessful,
  showErrorMessage,
} from 'uiSrc/utils'
import {
  SetListElementDto,
  GetListElementsResponse,
  ListActions,
  ListState,
  SearchListElementResponse,
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
  } catch (_err) {
    const error = _err as AxiosError
    const errorMessage = getApiErrorMessage(error)
    showErrorMessage(errorMessage)
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
  } catch (_err) {
    const error = _err as AxiosError
    const errorMessage = getApiErrorMessage(error)
    showErrorMessage(errorMessage)
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
  } catch (_err) {
    const error = _err as AxiosError
    const errorMessage = getApiErrorMessage(error)
    showErrorMessage(errorMessage)
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
      state.updateElementInList(data)
      onSuccess?.()
      refreshKeyInfo(data.keyName, false)
    }
  } catch (_err) {
    const error = _err as AxiosError
    const errorMessage = getApiErrorMessage(error)
    showErrorMessage(errorMessage)
    onFail?.()
  } finally {
    state.processListFinal()
  }
})

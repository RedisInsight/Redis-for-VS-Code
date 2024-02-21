import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { RedisResponseEncoding } from 'uiSrc/interfaces'
import { AppDispatch, RootState } from 'uiSrc/store'
import { GetServerInfoResponse, StateAppInfo } from './interface'

export const initialState: StateAppInfo = {
  loading: true,
  error: '',
  server: null,
  encoding: RedisResponseEncoding.Buffer,
}

// A slice for recipes
const appInfoSlice = createSlice({
  name: 'appInfo',
  initialState,
  reducers: {
    setServerInfoInitialState: () => initialState,
    getServerInfo: (state) => {
      state.loading = true
    },
    getServerInfoSuccess: (state, { payload }) => {
      state.loading = false
      state.server = payload
    },
    getServerInfoFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setEncoding: (state, { payload }: PayloadAction<RedisResponseEncoding>) => {
      state.encoding = payload
    },
  },
})

// Actions generated from the slice
export const {
  getServerInfo,
  getServerInfoSuccess,
  getServerInfoFailure,
  setEncoding,
} = appInfoSlice.actions

// A selector
export const appInfoSelector = (state: RootState) => state.app.info
export const appServerInfoSelector = (state: RootState) => state.app.info.server

// The reducer
export default appInfoSlice.reducer

// Asynchronous thunk action
export function fetchServerInfo(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getServerInfo())

    try {
      const { data, status } = await apiService.get<GetServerInfoResponse>(ApiEndpoints.INFO)

      if (isStatusSuccessful(status)) {
        dispatch(getServerInfoSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      dispatch(getServerInfoFailure(getApiErrorMessage(error as AxiosError)))
      onFailAction?.()
    }
  }
}

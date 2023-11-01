import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { AppDispatch, RootState } from 'uiSrc/store'
import { GetAgreementsSpecResponse, GetAppSettingsResponse, StateUserSettings } from './interface'

export const initialState: StateUserSettings = {
  loading: false,
  error: '',
  isShowConceptsPopup: null,
  config: null,
  spec: null,
}

// A slice for recipes
const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setUserSettingsInitialState: () => initialState,
    setSettingsPopupState: (state, { payload }) => {
      state.isShowConceptsPopup = payload
    },
    getUserConfigSettings: (state) => {
      state.loading = true
    },
    getUserConfigSettingsSuccess: (state, { payload }) => {
      state.loading = false
      state.config = payload
    },
    getUserConfigSettingsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    getUserSettingsSpec: (state) => {
      state.loading = true
    },
    getUserSettingsSpecSuccess: (state, { payload }) => {
      state.loading = false
      state.spec = payload
    },
    getUserSettingsSpecFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  setUserSettingsInitialState,
  setSettingsPopupState,
  getUserConfigSettings,
  getUserConfigSettingsSuccess,
  getUserConfigSettingsFailure,
  getUserSettingsSpec,
  getUserSettingsSpecSuccess,
  getUserSettingsSpecFailure,
} = userSettingsSlice.actions

// A selector
export const userSettingsSelector = (state: RootState) => state.user.settings
export const userSettingsConfigSelector = (state: RootState) => state.user.settings.config

// The reducer
export default userSettingsSlice.reducer

// Asynchronous thunk action
export function fetchAppInfo(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserConfigSettings())

    try {
      const { data, status } = await apiService.get<GetAppSettingsResponse>(ApiEndpoints.INFO)

      if (isStatusSuccessful(status)) {
        dispatch(getUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(getUserConfigSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUserConfigSettings(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserConfigSettings())

    try {
      const { data, status } = await apiService.get<GetAppSettingsResponse>(ApiEndpoints.SETTINGS)

      if (isStatusSuccessful(status)) {
        dispatch(getUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(getUserConfigSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUserSettingsSpec(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserSettingsSpec())

    try {
      const { data, status } = await apiService.get<GetAgreementsSpecResponse>(
        ApiEndpoints.SETTINGS_AGREEMENTS_SPEC
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUserSettingsSpecSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(getUserSettingsSpecFailure(errorMessage))
      onFailAction?.()
    }
  }
}

import { createSlice } from '@reduxjs/toolkit'
import { isString, uniqBy } from 'lodash'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, ICommand, ICommands } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { checkDeprecatedCommandGroup } from 'uiSrc/modules/cli/utils/cliHelper'
import { AppDispatch, RootState } from 'uiSrc/store'
import { StateAppRedisCommands } from './interface'

export const initialState: StateAppRedisCommands = {
  loading: false,
  error: '',
  spec: {},
  commandsArray: [],
  commandGroups: [],
}

// A slice for recipes
const appRedisCommandsSlice = createSlice({
  name: 'appRedisCommands',
  initialState,
  reducers: {
    getRedisCommands: (state) => {
      state.loading = true
    },
    getRedisCommandsSuccess: (state, { payload }: { payload: ICommands }) => {
      state.loading = false
      state.spec = payload
      state.commandsArray = Object.keys(state.spec).sort()
      state.commandGroups = uniqBy(Object.values(payload), 'group')
        .map((item: ICommand) => item.group)
        .filter((group: string) => isString(group))
        .filter((group: string) => !checkDeprecatedCommandGroup(group))
    },
    getRedisCommandsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  getRedisCommands,
  getRedisCommandsSuccess,
  getRedisCommandsFailure,
} = appRedisCommandsSlice.actions

// A selector
export const appRedisCommandsSelector = (state: RootState) => state.app.redisCommands

// The reducer
export default appRedisCommandsSlice.reducer

// Asynchronous thunk action
export function fetchRedisCommandsInfo(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getRedisCommands())

    try {
      const { data, status } = await apiService.get<ICommands>(ApiEndpoints.REDIS_COMMANDS)

      if (isStatusSuccessful(status)) {
        dispatch(getRedisCommandsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(getRedisCommandsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { find, orderBy } from 'lodash'
import { AxiosError } from 'axios'
import { ApiEndpoints, ConnectionType, StorageItem } from 'uiSrc/constants'
import { checkRediStack, getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { AppDispatch, RootState } from 'uiSrc/store'
import { apiService, localStorageService } from 'uiSrc/services'
import { Instance, InitialStateInstances } from './interface'

// const connectedInstanceId = ''
// const connectedInstanceId = 'e0344b61-9575-4af6-9b35-8723faeed6cd' // huge bd
const connectedInstanceId = '8544f487-0b45-4d69-94e7-0b5689e15526'

export const initialState: InitialStateInstances = {
  loading: false,
  error: '',
  data: [],
  freeInstance: null,
  connectedInstance: {
    id: connectedInstanceId,
    name: '',
    host: '',
    port: 0,
    version: '',
    nameFromProvider: '',
    lastConnection: new Date(),
    connectionType: ConnectionType.Standalone,
    isRediStack: false,
    modules: [],
    loading: false,
    isFreeDb: false,
  },
}

// A slice for recipes
const instancesSlice = createSlice({
  name: 'instances',
  initialState,
  reducers: {
    // load instancesS
    loadInstances: (state) => {
      state.loading = true
      state.error = ''
    },
    loadInstancesSuccess: (state, { payload }: PayloadAction<Instance[]>) => {
      state.data = checkRediStack(payload)
      state.loading = false
      state.freeInstance = find(
        [...(orderBy(payload, 'lastConnection', 'desc'))],
        'cloudDetails.free'
      ) as unknown as Instance || null
      if (state.connectedInstance.id) {
        const isRediStack = state.data.find((db) => db.id === state.connectedInstance.id)?.isRediStack
        state.connectedInstance.isRediStack = isRediStack || false
      }

      // TODO: remove after BE will be implemented
      // state.connectedInstance = first(payload) ?? state.connectedInstance
    },
    loadInstancesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  }
})

// Actions generated from the slice
export const {
  loadInstances,
  loadInstancesSuccess,
  loadInstancesFailure,
} = instancesSlice.actions

// selectors
export const instancesSelector = (state: RootState) => state.connections.instances
export const freeInstanceSelector = (state: RootState) => state.connections.instances.freeInstance
export const connectedInstanceSelector = (state: RootState) =>
  state.connections.instances.connectedInstance

// The reducer
export default instancesSlice.reducer

// Asynchronous thunk action
export function fetchInstancesAction(onSuccess?: (data?: Instance[]) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstances())

    try {
      const { data, status } = await apiService.get<Instance[]>(`${ApiEndpoints.DATABASES}`)

      if (isStatusSuccessful(status)) {
        localStorageService.set(StorageItem.instancesCount, data?.length)
        onSuccess?.(data)
        dispatch(loadInstancesSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadInstancesFailure(errorMessage))

      localStorageService.set(StorageItem.instancesCount, '0')
    }
  }
}

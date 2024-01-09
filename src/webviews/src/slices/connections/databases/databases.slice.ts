import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { find, orderBy } from 'lodash'
import { AxiosError } from 'axios'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, CONNECTED_DATABASE_ID, ConnectionType, StorageItem } from 'uiSrc/constants'
import { checkRediStack, getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { AppDispatch, RootState } from 'uiSrc/store'
import { Database, InitialStateDatabases } from './interface'

export const initialState: InitialStateDatabases = {
  loading: false,
  error: '',
  data: [],
  freeDatabase: null,
  connectedDatabase: {
    id: CONNECTED_DATABASE_ID,
    name: '',
    host: '',
    port: 0,
    version: '',
    nameFromProvider: '',
    lastConnection: null,
    connectionType: ConnectionType.Standalone,
    isRediStack: false,
    modules: [],
    loading: false,
    isFreeDb: false,
  },
}

// A slice for recipes
const databasesSlice = createSlice({
  name: 'databases',
  initialState,
  reducers: {
    // load databases
    loadDatabases: (state) => {
      state.loading = true
      state.error = ''
    },
    loadDatabasesSuccess: (state, { payload }: PayloadAction<Database[]>) => {
      state.data = checkRediStack(payload)
      state.loading = false
      state.freeDatabase = find(
        [...(orderBy(payload, 'lastConnection', 'desc'))],
        'cloudDetails.free',
      ) as unknown as Database || null
      if (state.connectedDatabase.id) {
        const isRediStack = state.data.find((db) => db.id === state.connectedDatabase.id)?.isRediStack
        state.connectedDatabase.isRediStack = isRediStack || false
      }

      // TODO: remove after database connection will be implemented
      state.connectedDatabase = payload.length
        ? payload.find(({ id }) => id === CONNECTED_DATABASE_ID) as Database
        : state.connectedDatabase
    },
    loadDatabasesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  loadDatabases,
  loadDatabasesSuccess,
  loadDatabasesFailure,
} = databasesSlice.actions

// selectors
export const databasesSelector = (state: RootState) => state.connections.databases
export const freeDatabaseSelector = (state: RootState) => state.connections.databases.freeDatabase
export const connectedDatabaseSelector = (state: RootState) =>
  state.connections.databases.connectedDatabase

// The reducer
export default databasesSlice.reducer

// Asynchronous thunk action
export function fetchDatabasesAction(onSuccess?: (data?: Database[]) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadDatabases())

    try {
      const { data, status } = await apiService.get<Database[]>(`${ApiEndpoints.DATABASES}`)

      if (isStatusSuccessful(status)) {
        localStorageService.set(StorageItem.databasesCount, data?.length)
        onSuccess?.(data)
        dispatch(loadDatabasesSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadDatabasesFailure(errorMessage))

      localStorageService.set(StorageItem.databasesCount, '0')
    }
  }
}

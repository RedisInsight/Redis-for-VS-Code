import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { find, orderBy } from 'lodash'
import { AxiosError } from 'axios'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, CONNECTED_DATABASE_ID, ConnectionType, StorageItem, successMessages } from 'uiSrc/constants'
import { checkRediStack, getApiErrorMessage, isStatusSuccessful, showErrorMessage, showInformationMessage } from 'uiSrc/utils'
import { AppDispatch, RootState } from 'uiSrc/store'
import { Database, InitialStateDatabases } from './interface'

export const initialState: InitialStateDatabases = {
  loading: false,
  error: '',
  data: [],
  freeDatabase: null,
  editDatabase: null,
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
    processDatabase: (state) => {
      state.loading = true
      state.error = ''
    },
    processDatabaseSuccess: (state) => {
      state.loading = false
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
    setEditDatabase: (state, { payload }:PayloadAction<Database>) => {
      state.editDatabase = payload
    },
  },
})

// Actions generated from the slice
export const {
  processDatabase,
  loadDatabasesSuccess,
  loadDatabasesFailure,
  processDatabaseSuccess,
  setEditDatabase,
} = databasesSlice.actions

// selectors
export const databasesSelector = (state: RootState) => state.connections.databases
export const freeDatabaseSelector = (state: RootState) => state.connections.databases.freeDatabase
export const editDatabaseSelector = (state: RootState) => state.connections.databases.editDatabase
export const connectedDatabaseSelector = (state: RootState) =>
  state.connections.databases.connectedDatabase

// The reducer
export default databasesSlice.reducer

// Asynchronous thunk action
export function fetchDatabasesAction(onSuccess?: (data?: Database[]) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(processDatabase())

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

// Asynchronous thunk action
export function createDatabaseStandaloneAction(
  payload: Database,
  onRedirectToSentinel?: () => void,
  onSuccess?: (id: string) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processDatabase())

    try {
      const { data, status } = await apiService.post(`${ApiEndpoints.DATABASES}`, payload)

      if (isStatusSuccessful(status)) {
        dispatch(processDatabaseSuccess())
        dispatch(fetchDatabasesAction())

        showInformationMessage(successMessages.ADDED_NEW_DATABASE(payload.name ?? '').title)
        onSuccess?.(data.id)
      }
    } catch (_error) {
      const error = _error as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
      // const errorCode = get(error, 'response.data.errorCode', 0) as CustomErrorCodes

      // if (errorCode === CustomErrorCodes.DatabaseAlreadyExists) {
      //   const databaseId: string = get(error, 'response.data.resource.databaseId', '')

      //   dispatch(autoCreateAndConnectToDatabaseActionSuccess(
      //     databaseId,
      //     successMessages.DATABASE_ALREADY_EXISTS(),
      //     () => {
      //       dispatch(defaultDatabaseChangingSuccess())
      //       onSuccess?.(databaseId)
      //     },
      //     () => { dispatch(defaultDatabaseChangingFailure(errorMessage)) },
      //   ))
      //   return
      // }

      // dispatch(defaultDatabaseChangingFailure(errorMessage))

      // if (error?.response?.data?.error === ApiErrors.SentinelParamsRequired) {
      //   checkoutToSentinelFlow(payload, dispatch, onRedirectToSentinel)
      //   return
      // }

      // dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function fetchEditedDatabaseAction(instance: Database, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(processDatabase())
    dispatch(setEditDatabase(instance))

    try {
      const { data, status } = await apiService.get<Database>(`${ApiEndpoints.DATABASES}/${instance.id}`)

      if (isStatusSuccessful(status)) {
        dispatch(setEditDatabase(data))
        dispatch(processDatabaseSuccess())
      }
      onSuccess?.()
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    }
  }
}

// Asynchronous thunk action
export function updateDatabaseAction({ id, ...payload }: Partial<Database>, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(processDatabase())

    try {
      const { status } = await apiService.patch(`${ApiEndpoints.DATABASES}/${id}`, payload)

      if (isStatusSuccessful(status)) {
        dispatch(processDatabaseSuccess())
        dispatch<any>(fetchDatabasesAction())
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    }
  }
}

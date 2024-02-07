import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { cloneDeep, filter, first, map, orderBy } from 'lodash'
import { apiService, localStorageService } from 'uiSrc/services'
import {
  ApiEndpoints,
  StorageItem,
  successMessages,
} from 'uiSrc/constants'
import {
  checkRediStack,
  getApiErrorMessage,
  isStatusSuccessful,
  showErrorMessage,
  showInformationMessage,
} from 'uiSrc/utils'
import { Database, DatabasesActions, DatabasesStore } from './interface'

export const initialDatabasesState: DatabasesStore = {
  loading: false,
  data: [],
  freeDatabases: [],
  editDatabase: null,
  connectedDatabase: null,
}

export const useDatabasesStore = create<DatabasesStore & DatabasesActions>()(
  immer(devtools((set) => ({
    ...initialDatabasesState,
    // actions
    processDatabase: () => set({ loading: true }),
    processDatabaseFinal: () => set({ loading: false }),

    loadDatabasesSuccess: (data) => set((state) => {
      state.data = checkRediStack(data)
      state.loading = false
      state.freeDatabases = filter(
        [...(orderBy(data, 'lastConnection', 'desc'))],
        'cloudDetails.free',
      ) as Database[] || null
    }),

    setEditDatabase: (editDatabase: Database) => set({ editDatabase }),
    setConnectedDatabase: (connectedDatabase: Database) => set({ connectedDatabase }),
    resetConnectedDatabase: () => set({ connectedDatabase: cloneDeep(initialDatabasesState.connectedDatabase) }),
  }))),
)

// Asynchronous thunk action
export const fetchDatabases = (onSuccess?: () => void) => {
  useDatabasesStore.setState(async (state) => {
    state.processDatabase()
    try {
      const { data, status } = await apiService.get<Database[]>(ApiEndpoints.DATABASES)

      if (isStatusSuccessful(status)) {
        localStorageService.set(StorageItem.databasesCount, data?.length)
        onSuccess?.()
        state.loadDatabasesSuccess(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
      localStorageService.set(StorageItem.databasesCount, '0')
    } finally {
      state.processDatabaseFinal()
    }
  })
}

export const createDatabaseStandalone = (
  payload: Database,
  onRedirectToSentinel?: () => void,
  onSuccess?: (id: string) => void,
) => {
  useDatabasesStore.setState(async (state) => {
    state.processDatabase()
    try {
      const { data, status } = await apiService.post(ApiEndpoints.DATABASES, payload)

      if (isStatusSuccessful(status)) {
        localStorageService.set(StorageItem.databasesCount, data?.length)
        fetchDatabases()
        onSuccess?.(data.id)

        showInformationMessage(successMessages.ADDED_NEW_DATABASE(payload.name ?? '').title)
      }
    } catch (_err) {
      const error = _err as AxiosError
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
    } finally {
      state.processDatabaseFinal()
    }
  })
}

export const fetchEditedDatabase = (instance: Database, onSuccess?: () => void) => {
  useDatabasesStore.setState(async (state) => {
    state.processDatabase()
    state.setEditDatabase(instance)
    try {
      const { data, status } = await apiService.get<Database>(`${ApiEndpoints.DATABASES}/${instance.id}`)

      if (isStatusSuccessful(status)) {
        state.setEditDatabase(data)
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    } finally {
      state.processDatabaseFinal()
    }
  })
}

export const updateDatabase = ({ id, ...payload }: Partial<Database>, onSuccess?: () => void) => {
  useDatabasesStore.setState(async (state) => {
    state.processDatabase()
    try {
      const { status } = await apiService.patch(`${ApiEndpoints.DATABASES}/${id}`, payload)

      if (isStatusSuccessful(status)) {
        fetchDatabases()
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    } finally {
      state.processDatabaseFinal()
    }
  })
}

export function checkConnectToDatabase(
  id: string = '',
  onSuccessAction?: (id: string) => void,
  onFailAction?: () => void,
  resetInstance: boolean = true,
) {
  useDatabasesStore.setState(async (state) => {
    state.processDatabase()
    resetInstance && state.resetConnectedDatabase()
    try {
      const { status } = await apiService.get(`${ApiEndpoints.DATABASES}/${id}/connect`)

      if (isStatusSuccessful(status)) {
        onSuccessAction?.(id)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
      onFailAction?.()
    } finally {
      state.processDatabaseFinal()
    }
  })
}

export const deleteDatabases = (databases: Database[], onSuccess?: () => void) => {
  useDatabasesStore.setState(async (state) => {
    state.processDatabase()
    try {
      const ids = map(databases, 'id')
      const { status } = await apiService.delete(ApiEndpoints.DATABASES, { data: { ids } })

      if (isStatusSuccessful(status)) {
        fetchDatabases()
        onSuccess?.()
        showInformationMessage(successMessages.DELETE_DATABASE(first(databases)?.name ?? '').title)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    } finally {
      state.processDatabaseFinal()
    }
  })
}

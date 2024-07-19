import { create } from 'zustand'
import { AxiosError } from 'axios'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
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
  getUrl,
  isStatusSuccessful,
  showErrorMessage,
  showInformationMessage,
} from 'uiSrc/utils'
import { Database, DatabaseOverview, DatabasesActions, DatabasesStore } from './interface'

export const initialDatabasesState: DatabasesStore = {
  loading: false,
  data: [],
  freeDatabases: [],
  editDatabase: null,
  connectedDatabase: null,
  databaseOverview: {
    version: '',
  },
}

export const useDatabasesStore = create<DatabasesStore & DatabasesActions>()(
  immer(devtools(persist((set, get) => ({
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

    getDatabaseOverviewSuccess: (data: DatabaseOverview) => set({
      databaseOverview: {
        ...data,
        version: data?.version || get().databaseOverview.version || '',
      },
    }),
  }), {
    name: 'databases',
    storage: createJSONStorage(() => sessionStorage),
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
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
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

        showInformationMessage(successMessages.ADDED_NEW_DATABASE(payload.name ?? '').title)

        onSuccess?.(data.id)
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
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

export const fetchEditedDatabase = (database: Database, onSuccess?: () => void) => {
  useDatabasesStore.setState(async (state) => {
    state.processDatabase()
    state.setEditDatabase(database)
    try {
      const { data, status } = await apiService.get<Database>(`${ApiEndpoints.DATABASES}/${database.id}`)

      if (isStatusSuccessful(status)) {
        state.setEditDatabase(data)
        onSuccess?.()
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
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
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
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
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
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
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    } finally {
      state.processDatabaseFinal()
    }
  })
}

export const fetchDatabaseOverview = () => {
  useDatabasesStore.setState(async (state) => {
    try {
      const { data, status } = await apiService.get<DatabaseOverview>(getUrl(ApiEndpoints.OVERVIEW))

      if (isStatusSuccessful(status)) {
        state.getDatabaseOverviewSuccess(data)
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    }
  })
}

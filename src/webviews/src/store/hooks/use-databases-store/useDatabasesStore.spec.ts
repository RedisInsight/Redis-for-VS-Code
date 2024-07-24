import { cloneDeep } from 'lodash'

import { apiService } from 'uiSrc/services'
import { checkRediStack } from 'uiSrc/utils'
import { ConnectionType } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import {
  cleanup,
  waitForStack,
} from 'testSrc/helpers'
import {
  fetchDatabases,
  useDatabasesStore,
  createDatabaseStandalone,
  fetchEditedDatabase,
  updateDatabase,
  checkConnectToDatabase,
  deleteDatabases,
  fetchDatabaseOverview,
} from './useDatabasesStore'

let databases: any[]

vi.spyOn(utils, 'showErrorMessage')
vi.spyOn(utils, 'showInformationMessage')

const versionMock = '123'
const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
const errorResponsePayload = {
  response: {
    status: 500,
    data: { message: errorMessage },
  },
}

beforeEach(() => {
  databases = [
    {
      id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
      host: 'localhost',
      port: 6379,
      name: 'localhost',
      username: null,
      password: null,
      connectionType: ConnectionType.Standalone,
      nameFromProvider: null,
      modules: [],
      lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    },
    {
      id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
      host: 'localhost',
      port: 12000,
      name: 'oea123123',
      username: null,
      password: null,
      connectionType: ConnectionType.Standalone,
      nameFromProvider: null,
      modules: [],
      tls: {
        verifyServerCert: true,
        caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
        clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
      },
    },
    {
      id: 'b83a3932-e95f-4f09-9d8a-55079f400186',
      host: 'localhost',
      port: 5005,
      name: 'sentinel',
      username: null,
      password: null,
      connectionType: ConnectionType.Sentinel,
      nameFromProvider: null,
      lastConnection: new Date('2021-04-22T18:40:44.031Z'),
      modules: [],
      endpoints: [
        {
          host: 'localhost',
          port: 5005,
        },
        {
          host: '127.0.0.1',
          port: 5006,
        },
      ],
      sentinelMaster: {
        name: 'mymaster',
      },
    },
  ]
})

describe('useDatabasesStore', () => {
  describe('loadDatabases', () => {
    it('should properly set loading = true', () => {
      // Act
      const { processDatabase } = useDatabasesStore.getState()

      processDatabase()

      // Assert
      expect(useDatabasesStore.getState().loading).toEqual(true)
    })
  })

  describe('loadDatabasesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const { loadDatabasesSuccess } = useDatabasesStore.getState()

      loadDatabasesSuccess(databases)

      // Assert
      expect(useDatabasesStore.getState().data).toEqual(checkRediStack(databases))
    })

    it('should properly set the state with empty data', () => {
      const { loadDatabasesSuccess } = useDatabasesStore.getState()

      loadDatabasesSuccess([])

      // Assert
      expect(useDatabasesStore.getState().data).toEqual([])
    })
  })

  describe('thunks', () => {
    describe('fetchDatabases', () => {
      it('call both fetchDatabases and loadDatabasesSuccess when fetch is successed', async () => {
        // Arrange
        const responsePayload = { data: databases, status: 200 }

        apiService.get = vi.fn().mockResolvedValue(responsePayload)

        // Act
        fetchDatabases()
        await waitForStack()

        expect(useDatabasesStore.getState().data).toEqual(checkRediStack(databases))
        expect(useDatabasesStore.getState().loading).toEqual(false)
      })

      it('call both fetchDatabases and showErrorMessage when fetch is fail', async () => {
        // Arrange
        useDatabasesStore.setState((state) => ({ ...state, data: [] }))

        apiService.get = vi.fn().mockRejectedValueOnce(errorResponsePayload)

        // Act
        fetchDatabases()
        await waitForStack()

        // Assert
        expect(useDatabasesStore.getState().data).toEqual([])
        expect(useDatabasesStore.getState().loading).toEqual(false)
        expect(utils.showErrorMessage).toBeCalled()
      })
    })

    describe('fetchEditedDatabase', () => {
      it('call both fetchEditedDatabase and setEditDatabase when fetch is successed', async () => {
        // Arrange
        const data = { ...databases[0], password: true }
        const responsePayload = { data, status: 200 }

        apiService.get = vi.fn().mockResolvedValue(responsePayload)

        // Act
        fetchEditedDatabase(databases[0])
        await waitForStack()

        expect(useDatabasesStore.getState().editDatabase).toEqual(data)
        expect(useDatabasesStore.getState().loading).toEqual(false)
      })

      it('call both fetchEditedDatabase and showErrorMessage when fetch is fail', async () => {
        // Arrange
        useDatabasesStore.setState((state) => ({ ...state, data: [] }))

        apiService.get = vi.fn().mockRejectedValueOnce(errorResponsePayload)

        // Act
        fetchEditedDatabase(databases[0])
        await waitForStack()

        // Assert
        expect(useDatabasesStore.getState().editDatabase).toEqual(databases[0])
        expect(useDatabasesStore.getState().loading).toEqual(false)
        expect(utils.showErrorMessage).toBeCalled()
      })
    })

    describe('createDatabaseStandalone', () => {
      it('call both createDatabaseStandalone when fetch is successed', async () => {
        // Arrange
        const data = { ...databases[0], password: true }
        const responsePayload = { data, status: 200 }
        const responseGetPayload = { data: [databases[2]], status: 200 }

        apiService.get = vi.fn().mockResolvedValue(responseGetPayload)
        apiService.post = vi.fn().mockResolvedValue(responsePayload)

        // Act
        createDatabaseStandalone(databases[0])
        await waitForStack()

        expect(utils.showInformationMessage).toBeCalledWith('Database has been added')
        expect(useDatabasesStore.getState().loading).toEqual(false)
      })

      it('call showErrorMessage when fetch is fail', async () => {
        // Arrange
        useDatabasesStore.setState((state) => ({ ...state, data: [] }))

        apiService.post = vi.fn().mockRejectedValueOnce(errorResponsePayload)

        // Act
        createDatabaseStandalone(databases[0])
        await waitForStack()

        // Assert
        expect(useDatabasesStore.getState().editDatabase).toEqual(databases[0])
        expect(useDatabasesStore.getState().loading).toEqual(false)
        expect(utils.showErrorMessage).toBeCalled()
      })
    })

    describe('deleteDatabases', () => {
      it('call both deleteDatabases and fetchDatabases when fetch is successed', async () => {
        // Arrange
        const responseDeletePayload = { status: 200 }
        const responseGetPayload = { data: [databases[1]], status: 200 }

        apiService.get = vi.fn().mockResolvedValue(responseGetPayload)
        apiService.delete = vi.fn().mockResolvedValue(responseDeletePayload)

        // Act
        deleteDatabases(databases)
        await waitForStack()

        expect(utils.showInformationMessage).toBeCalledWith('Database has been deleted')
        expect(useDatabasesStore.getState().data).toEqual(checkRediStack([databases[1]]))
        expect(useDatabasesStore.getState().loading).toEqual(false)
      })

      it('call showErrorMessage when fetch is fail', async () => {
        // Arrange
        useDatabasesStore.setState((state) => ({ ...state, data: [] }))

        apiService.delete = vi.fn().mockRejectedValueOnce(errorResponsePayload)

        // Act
        deleteDatabases(databases[0])
        await waitForStack()

        // Assert
        expect(useDatabasesStore.getState().editDatabase).toEqual(databases[0])
        expect(useDatabasesStore.getState().loading).toEqual(false)
        expect(utils.showErrorMessage).toBeCalled()
      })
    })

    describe('updateDatabase', () => {
      it('call both updateDatabase and fetchDatabases when fetch is successed', async () => {
        // Arrange
        const responsePatchPayload = { status: 200 }
        const responseGetPayload = { data: [databases[1]], status: 200 }

        apiService.get = vi.fn().mockResolvedValue(responseGetPayload)
        apiService.patch = vi.fn().mockResolvedValue(responsePatchPayload)

        // Act
        updateDatabase(databases[1])
        await waitForStack()

        expect(useDatabasesStore.getState().data).toEqual(checkRediStack([databases[1]]))
        expect(useDatabasesStore.getState().loading).toEqual(false)
      })

      it('call showErrorMessage when fetch is fail', async () => {
        // Arrange
        useDatabasesStore.setState((state) => ({ ...state, data: [] }))

        apiService.patch = vi.fn().mockRejectedValueOnce(errorResponsePayload)

        // Act
        updateDatabase(databases[0])
        await waitForStack()

        // Assert
        expect(useDatabasesStore.getState().data).toEqual([])
        expect(useDatabasesStore.getState().loading).toEqual(false)
        expect(utils.showErrorMessage).toBeCalled()
      })
    })

    describe('checkConnectToDatabase', () => {
      it('call checkConnectToDatabase when fetch is successed', async () => {
        // Arrange
        const responseGetPayload = { status: 200 }

        apiService.get = vi.fn().mockResolvedValue(responseGetPayload)

        // Act
        checkConnectToDatabase(databases[1].id)
        await waitForStack()

        expect(useDatabasesStore.getState().loading).toEqual(false)
      })

      it('call showErrorMessage when fetch is fail', async () => {
        // Arrange
        useDatabasesStore.setState((state) => ({ ...state, data: [] }))

        apiService.get = vi.fn().mockRejectedValueOnce(errorResponsePayload)

        // Act
        checkConnectToDatabase(databases[0].id)
        await waitForStack()

        // Assert
        expect(useDatabasesStore.getState().data).toEqual([])
        expect(useDatabasesStore.getState().loading).toEqual(false)
        expect(utils.showErrorMessage).toBeCalled()
      })
    })

    describe('fetchDatabaseOverview', () => {
      it('call fetchDatabaseOverview when fetch is successed', async () => {
        // Arrange
        const responseGetPayload = { status: 200, data: { version: versionMock } }

        apiService.get = vi.fn().mockResolvedValue(responseGetPayload)

        // Act
        fetchDatabaseOverview()
        await waitForStack()

        expect(useDatabasesStore.getState().databaseOverview.version).toEqual(versionMock)
      })

      it('when fetch is fail version should be previous', async () => {
        // Arrange
        useDatabasesStore.setState((state) => ({ ...state, data: [] }))

        apiService.get = vi.fn().mockRejectedValueOnce(errorResponsePayload)

        // Act
        fetchDatabaseOverview()
        await waitForStack()

        // Assert
        expect(useDatabasesStore.getState().databaseOverview.version).toEqual(versionMock)
        expect(useDatabasesStore.getState().loading).toEqual(false)
        expect(utils.showErrorMessage).toBeCalled()
      })
    })
  })
})

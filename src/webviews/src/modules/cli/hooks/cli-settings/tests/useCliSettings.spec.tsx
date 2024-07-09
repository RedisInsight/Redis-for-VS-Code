import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useCliSettingsStore,
  initialCliSettingsState as initialStateInit,
} from '../useCliSettingsStore'
import {
  deleteCliClientAction,
  fetchBlockingCliCommandsAction,
  fetchUnsupportedCliCommandsAction,
  updateCliClientAction,
} from '../useCliSettingsThunks'

import * as useCliOutput from '../../cli-output/useCliOutputStore'

beforeEach(() => {
  useCliSettingsStore.setState(initialStateInit)
})

const spyCliOutput = vi.spyOn(useCliOutput, 'useCliOutputStore')
afterEach(() => {
  spyCliOutput.mockRestore()
  vi.clearAllMocks()
})


describe('useCliSettingsStore', () => {
  it('processCliClient', () => {
    // Arrange
    const { processCliClient } = useCliSettingsStore.getState()
    // Act
    processCliClient()
    // Assert
    expect(useCliSettingsStore.getState().loading).toEqual(true)
  })

  it('processCliClientFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { processCliClientFinal } = useCliSettingsStore.getState()
    // Act
    processCliClientFinal()
    // Assert
    expect(useCliSettingsStore.getState().loading).toEqual(false)
  })
  it('processCliClientFailure', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { processCliClientFailure } = useCliSettingsStore.getState()
    // Act
    processCliClientFailure(constants.KEY_1_VALUE)
    // Assert
    expect(useCliSettingsStore.getState().errorClient).toEqual(constants.KEY_1_VALUE)
  })
  it('setMatchedCommand', () => {
    // Arrange
    const initialState = { ...initialStateInit, matchedCommand: '1' } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { setMatchedCommand } = useCliSettingsStore.getState()
    // Act
    setMatchedCommand('3')
    // Assert
    expect(useCliSettingsStore.getState().matchedCommand).toEqual('3')
  })
  it('setCliEnteringCommand', () => {
    // Arrange
    const initialState = { ...initialStateInit, isEnteringCommand: false } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { setCliEnteringCommand } = useCliSettingsStore.getState()
    // Act
    setCliEnteringCommand()
    // Assert
    expect(useCliSettingsStore.getState().isEnteringCommand).toEqual(true)
  })
  it('processCliClientSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, cliClientUuid: '1' } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { processCliClientSuccess } = useCliSettingsStore.getState()
    // Act
    processCliClientSuccess('2')
    // Assert
    expect(useCliSettingsStore.getState().cliClientUuid).toEqual('2')
  })
  it('getUnsupportedCommandsSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, unsupportedCommands: [] } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { getUnsupportedCommandsSuccess } = useCliSettingsStore.getState()
    // Act
    getUnsupportedCommandsSuccess(['A', 'B'])
    // Assert
    expect(useCliSettingsStore.getState().unsupportedCommands).toEqual(['a', 'b'])
  })
  it('getBlockingCommandsSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, blockingCommands: [] } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { getBlockingCommandsSuccess } = useCliSettingsStore.getState()
    // Act
    getBlockingCommandsSuccess(['A', 'B'])
    // Assert
    expect(useCliSettingsStore.getState().blockingCommands).toEqual(['a', 'b'])
  })
  it('clearSearchingCommand', () => {
    // Arrange
    const initialState = {
      ...initialStateInit,
      searchingCommand: '123',
      searchedCommand: '123',

      isSearching: true,
      searchingCommandFilter: '123'
    } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { clearSearchingCommand } = useCliSettingsStore.getState()
    // Act
    clearSearchingCommand()
    // Assert
    expect(useCliSettingsStore.getState().searchingCommand).toEqual('')
    expect(useCliSettingsStore.getState().searchedCommand).toEqual('')
    expect(useCliSettingsStore.getState().isSearching).toEqual(false)
    expect(useCliSettingsStore.getState().searchingCommandFilter).toEqual('')
  })

  it('addCliConnectionsHistory', () => {
    // Arrange
    const initialState = { ...initialStateInit, cliConnectionsHistory: [{ id: '1' , name: '1', cliHistory: ['1']}] } // Custom initial state
    useCliSettingsStore.setState((state) => ({ ...state, ...initialState }))

    const { addCliConnectionsHistory } = useCliSettingsStore.getState()
    // Act
    addCliConnectionsHistory({ id: '2' , name: '2', cliHistory: ['3']})
    // Assert
    expect(useCliSettingsStore.getState().cliConnectionsHistory).toEqual([
      { id: '1' , name: '1', cliHistory: ['1']},
      { id: '2' , name: '2', cliHistory: ['3']},
    ])
  })
})


describe('thunks', () => {
  it('call set cliClientUuid when fetch is successed', async () => {
    // Arrange
    const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
    const data = { uuid }
    const responsePayload = { data, status: 200 }

    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    // Act
    updateCliClientAction(uuid)
    await waitForStack()

    // Assert
    expect(useCliSettingsStore.getState().cliClientUuid).toEqual(uuid)
  })

  it('call both updateCliClientAction and processCliClientFailure when fetch is fail', async () => {
    // Arrange
    const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
    const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
    const responsePayload = {
      response: {
        status: 500,
        data: { message: errorMessage },
      },
    }

    apiService.patch = vi.fn().mockRejectedValueOnce(responsePayload)

    // Act
    updateCliClientAction(uuid)
    await waitForStack()

    // Assert
    expect(useCliSettingsStore.getState().errorClient).toEqual(errorMessage)
  })

  it('call set loading=false when fetch is successed', async () => {
    // Arrange
    useCliSettingsStore.setState((state)=> ({ ...state, loading: true }))
    const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
    const data = { uuid }
    const responsePayload = { data, status: 200 }

    apiService.delete = vi.fn().mockResolvedValue(responsePayload)

    // Act
    deleteCliClientAction(uuid)
    await waitForStack()

    // Assert
    expect(useCliSettingsStore.getState().loading).toEqual(false)
  })

  it('call both deleteCliClientAction and processCliClientFailure when fetch is fail', async () => {
    // Arrange
    const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
    const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
    const responsePayload = {
      response: {
        status: 500,
        data: { message: errorMessage },
      },
    }

    apiService.delete = vi.fn().mockRejectedValueOnce(responsePayload)

    // Act
    deleteCliClientAction(uuid)
    await waitForStack()

    // Assert
    expect(useCliSettingsStore.getState().errorClient).toEqual(errorMessage)
  })

  it('call both fetchUnsupportedCliCommandsAction and getUnsupportedCommandsSuccess when fetch is successed', async () => {
    // Arrange
    const data = ['sync', 'subscribe']
    const responsePayload = { data, status: 200 }

    apiService.get = vi.fn().mockResolvedValue(responsePayload)

    // Act
    fetchUnsupportedCliCommandsAction()
    await waitForStack()
    // Assert
    expect(useCliSettingsStore.getState().unsupportedCommands).toEqual(data)
  })

  it('call both fetchBlockingCliCommandsAction and getBlockingCommandsSuccess when fetch is successed', async () => {
    // Arrange
    const data = ['sync', 'subscribe']
    const responsePayload = { data, status: 200 }

    apiService.get = vi.fn().mockResolvedValue(responsePayload)

    // Act
    fetchBlockingCliCommandsAction()
    await waitForStack()
    // Assert
    expect(useCliSettingsStore.getState().blockingCommands).toEqual(data)
  })
})

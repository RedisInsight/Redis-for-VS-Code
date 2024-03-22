import * as modules from 'uiSrc/modules'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useRedisCommandsStore,
  initialRedisCommandsState,
  fetchRedisCommands,
} from './useRedisCommandsStore'

vi.spyOn(modules, 'fetchString')

beforeEach(() => {
  useRedisCommandsStore.setState(initialRedisCommandsState)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useRedisCommandsStore', () => {
  it('processRedisCommands', () => {
    // Arrange
    const { processRedisCommands } = useRedisCommandsStore.getState()
    // Act
    processRedisCommands()
    // Assert
    expect(useRedisCommandsStore.getState().loading).toEqual(true)
  })

  it('processRedisCommandsFinal', () => {
    // Arrange
    const initialState = { ...initialRedisCommandsState, loading: true } // Custom initial state
    useRedisCommandsStore.setState((state) => ({ ...state, ...initialState }))

    const { processRedisCommandsFinal } = useRedisCommandsStore.getState()
    // Act
    processRedisCommandsFinal()
    // Assert
    expect(useRedisCommandsStore.getState().loading).toEqual(false)
  })
  it('processRedisCommandsSuccess', () => {
    // Arrange
    const initialState = { ...initialRedisCommandsState, loading: true } // Custom initial state
    useRedisCommandsStore.setState((state) => ({ ...state, ...initialState }))

    const { processRedisCommandsSuccess } = useRedisCommandsStore.getState()
    // Act
    processRedisCommandsSuccess(constants.REDIS_COMMANDS)
    // Assert
    expect(useRedisCommandsStore.getState().commandsArray).toEqual(constants.REDIS_COMMANDS_ARRAY)
    expect(useRedisCommandsStore.getState().commandGroups).toEqual(constants.REDIS_COMMANDS_GROUPS)
  })
})

describe('async', () => {
  it('fetchRedisCommands', async () => {
    fetchRedisCommands()
    await waitForStack()

    expect(useRedisCommandsStore.getState().commandsArray).toEqual(constants.REDIS_COMMANDS_ARRAY)
    expect(useRedisCommandsStore.getState().commandGroups).toEqual(constants.REDIS_COMMANDS_GROUPS)
    expect(useRedisCommandsStore.getState().loading).toEqual(false)
  })
})

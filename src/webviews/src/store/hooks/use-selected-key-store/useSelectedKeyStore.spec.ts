import { apiService } from 'uiSrc/services'
import * as modules from 'uiSrc/modules'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useSelectedKeyStore,
  initialSelectedKeyState as initialStateInit,
  fetchKeyInfo,
  editKeyTTL,
  refreshKeyInfo,
  editKey,
} from './useSelectedKeyStore'

vi.spyOn(modules, 'fetchString')

beforeEach(() => {
  useSelectedKeyStore.setState(initialStateInit)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useSelectedKeyStore', () => {
  it('processSelectedKey', () => {
    // Arrange
    const { processSelectedKey } = useSelectedKeyStore.getState()
    // Act
    processSelectedKey()
    // Assert
    expect(useSelectedKeyStore.getState().loading).toEqual(true)
  })

  it('processSelectedKeyFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useSelectedKeyStore.setState((state) => ({ ...state, ...initialState }))

    const { processSelectedKeyFinal } = useSelectedKeyStore.getState()
    // Act
    processSelectedKeyFinal()
    // Assert
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })
  it('processSelectedKeySuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useSelectedKeyStore.setState((state) => ({ ...state, ...initialState }))

    const { processSelectedKeySuccess } = useSelectedKeyStore.getState()
    // Act
    processSelectedKeySuccess(constants.KEY_INFO)
    // Assert
    const expectedData = {
      ...constants.KEY_INFO,
      nameString: constants.KEY_NAME_STRING_1,
    }

    expect(useSelectedKeyStore.getState().data).toEqual(expectedData)
  })
  it('refreshSelectedKey', () => {
    // Arrange
    const { refreshSelectedKey } = useSelectedKeyStore.getState()
    // Act
    refreshSelectedKey()
    // Assert
    expect(useSelectedKeyStore.getState().refreshing).toEqual(true)
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })

  it('refreshSelectedKeyFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, refreshing: true } // Custom initial state
    useSelectedKeyStore.setState((state) => ({ ...state, ...initialState }))

    const { refreshSelectedKeyFinal } = useSelectedKeyStore.getState()
    // Act
    refreshSelectedKeyFinal()
    // Assert
    expect(useSelectedKeyStore.getState().refreshing).toEqual(false)
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })
})

describe('async', () => {
  it('fetchKeyInfo', async () => {
    const expectedData = {
      ...constants.KEY_INFO,
      nameString: constants.KEY_NAME_STRING_1,
    }

    fetchKeyInfo({ key: constants.KEY_NAME_1 })
    await waitForStack()

    expect(useSelectedKeyStore.getState().data).toEqual(expectedData)
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })

  it('refreshKeyInfo should not call fetchKeyInfo', async () => {
    const responsePayload = { data: constants.KEY_INFO, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    refreshKeyInfo(constants.KEY_NAME_1, false)
    await waitForStack()

    expect(modules.fetchString).not.toBeCalled()
  })

  it('refreshKeyInfo should call fetchKeyInfo', async () => {
    const responsePayload = { data: constants.KEY_INFO, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    refreshKeyInfo(constants.KEY_NAME_1, true)
    await waitForStack()

    expect(modules.fetchString).toBeCalledTimes(1)
  })

  it('refreshKeyInfo', async () => {
    const expectedData = {
      ...constants.KEY_INFO,
      nameString: constants.KEY_NAME_STRING_1,
    }

    refreshKeyInfo(constants.KEY_NAME_1)
    await waitForStack()

    expect(useSelectedKeyStore.getState().data).toEqual(expectedData)
    expect(useSelectedKeyStore.getState().refreshing).toEqual(false)
  })

  it('editKeyTTL', async () => {
    const expectedData = {
      ...constants.KEY_INFO,
      ttl: constants.KEY_TTL_2,
      nameString: constants.KEY_NAME_STRING_1,
    }

    const responsePayload = { data: { ...constants.KEY_INFO, ttl: constants.KEY_TTL_2 }, status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    editKeyTTL(constants.KEY_NAME_1, constants.KEY_TTL_2)

    await waitForStack()

    expect(useSelectedKeyStore.getState().data).toEqual(expectedData)
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })

  it('editKey', async () => {
    useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
    const expectedData = {
      ...constants.KEY_INFO,
      name: constants.KEY_NAME_2,
      nameString: constants.KEY_NAME_HASH_2,
    }

    const responsePayload = { status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    editKey(constants.KEY_NAME_1, constants.KEY_NAME_2)

    await waitForStack()

    expect(useSelectedKeyStore.getState().data).toEqual(expectedData)
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })
})

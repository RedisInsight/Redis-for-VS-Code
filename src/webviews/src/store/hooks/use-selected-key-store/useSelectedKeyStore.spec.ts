import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import { useSelectedKeyStore, initialState as initialStateInit, fetchKeyInfo, editKeyTTL } from './useSelectedKeyStore'

beforeEach(() => {
  useSelectedKeyStore.setState((initialStateInit))
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
})

describe('async', () => {
  it.only('fetchKeyInfo', async () => {
    const expectedData = {
      ...constants.KEY_INFO,
      nameString: constants.KEY_NAME_STRING_1,
    }

    fetchKeyInfo(constants.KEY_NAME_1)
    await waitForStack()

    expect(useSelectedKeyStore.getState().data).toEqual(expectedData)
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })
  it.only('editKeyTTL', async () => {
    const expectedData = {
      ...constants.KEY_INFO,
      ttl: constants.KEY_TTL_2,
      nameString: constants.KEY_NAME_STRING_1,
    }

    const responsePayload = { data: { ...constants.KEY_INFO, ttl: constants.KEY_TTL_2 }, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    editKeyTTL(constants.KEY_NAME_1, constants.KEY_TTL_2)

    await waitForStack()

    expect(useSelectedKeyStore.getState().data).toEqual(expectedData)
    expect(useSelectedKeyStore.getState().loading).toEqual(false)
  })
})

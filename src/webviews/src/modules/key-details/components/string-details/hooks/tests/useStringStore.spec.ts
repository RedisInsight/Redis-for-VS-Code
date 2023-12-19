import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import { useStringStore, initialState as initialStateInit, fetchString } from '../useStringStore'

beforeEach(() => {
  useStringStore.setState((initialStateInit))
})

describe('useStringStore', () => {
  it('processString', () => {
    // Arrange
    const { processString } = useStringStore.getState()
    // Act
    processString()
    // Assert
    expect(useStringStore.getState().loading).toEqual(true)
  })
  it('setIsStringCompressed', () => {
    // Arrange
    const { setIsStringCompressed } = useStringStore.getState()
    // Act
    setIsStringCompressed(true)
    // Assert
    expect(useStringStore.getState().isCompressed).toEqual(true)
  })
  it('processStringFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useStringStore.setState((state) => ({ ...state, ...initialState }))

    const { processStringFinal } = useStringStore.getState()
    // Act
    processStringFinal()
    // Assert
    expect(useStringStore.getState().loading).toEqual(false)
  })
  it('processStringSuccess', () => {
    // Arrange
    const data = { keyName: constants.KEY_NAME_1, value: constants.KEY_1_VALUE }
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useStringStore.setState((state) => ({ ...state, ...initialState }))

    const { processStringSuccess } = useStringStore.getState()
    // Act
    processStringSuccess(data)
    // Assert
    expect(useStringStore.getState().data.key).toEqual(constants.KEY_NAME_1)
    expect(useStringStore.getState().data.value).toEqual(constants.KEY_1_VALUE)
  })
})

describe('async', () => {
  it('fetchString', async () => {
    const data = { keyName: constants.KEY_NAME_1, value: constants.KEY_1_VALUE }
    const responsePayload = { data, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchString(constants.KEY_NAME_1)
    await waitForStack()

    expect(useStringStore.getState().data.key).toEqual(constants.KEY_NAME_1)
    expect(useStringStore.getState().data.value).toEqual(constants.KEY_1_VALUE)
    expect(useStringStore.getState().loading).toEqual(false)
  })
})

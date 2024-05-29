import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useRejsonStore,
  initialState as initialStateInit,
  fetchReJSON,
  setReJSONDataAction,
  appendReJSONArrayItemAction,
  removeReJSONKeyAction,
} from '../useRejsonStore'
import * as store from 'uiSrc/store'

vi.spyOn(store, 'refreshKeyInfo')

beforeEach(() => {
  useRejsonStore.setState(initialStateInit)
})

describe('useRejsonStore', () => {
  it('processRejson', () => {
    // Arrange
    const { processRejson } = useRejsonStore.getState()
    // Act
    processRejson()
    // Assert
    expect(useRejsonStore.getState().loading).toEqual(true)
  })

  it('processRejsonFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useRejsonStore.setState((state) => ({ ...state, ...initialState }))

    const { processRejsonFinal } = useRejsonStore.getState()
    // Act
    processRejsonFinal()
    // Assert
    expect(useRejsonStore.getState().loading).toEqual(false)
  })
  it('processRejsonSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useRejsonStore.setState((state) => ({ ...state, ...initialState }))

    const { processRejsonSuccess } = useRejsonStore.getState()
    // Act
    processRejsonSuccess(constants.REJSON_DATA_RESPONSE)
    // Assert
    expect(useRejsonStore.getState().data.data).toEqual(constants.REJSON_DATA_RESPONSE.data)
    expect(useRejsonStore.getState().data.downloaded).toEqual(constants.REJSON_DATA_RESPONSE.downloaded)
    expect(useRejsonStore.getState().data.path).toEqual(constants.REJSON_DATA_RESPONSE.path)
  })

})

describe('async', () => {
  it('fetchReJSON', async () => {
    const data = constants.REJSON_DATA_RESPONSE
    const responsePayload = { data, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchReJSON(constants.KEY_NAME_4, '.')
    await waitForStack()

    expect(useRejsonStore.getState().data.data).toEqual(constants.REJSON_DATA_RESPONSE.data)
    expect(useRejsonStore.getState().data.downloaded).toEqual(constants.REJSON_DATA_RESPONSE.downloaded)
    expect(useRejsonStore.getState().data.path).toEqual(constants.REJSON_DATA_RESPONSE.path)
    expect(useRejsonStore.getState().loading).toEqual(false)
  })

  it('setReJSONDataAction', async () => {
    const responsePayload = { status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    setReJSONDataAction(constants.KEY_NAME_4, '.', '123')
    await waitForStack()

    expect(useRejsonStore.getState().loading).toEqual(false)
  })

  it('appendReJSONArrayItemAction', async () => {
    const responsePayload = { status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    appendReJSONArrayItemAction(constants.KEY_NAME_4, '.', '123')
    await waitForStack()

    expect(useRejsonStore.getState().loading).toEqual(false)
  })


  it('removeReJSONKeyAction', async () => {
    const responsePayload = { data: {}, status: 200 }
    apiService.delete = vi.fn().mockResolvedValue(responsePayload)

    removeReJSONKeyAction(constants.KEY_NAME_4, '.',)
    await waitForStack()

    expect(useRejsonStore.getState().loading).toEqual(false)
  })
})

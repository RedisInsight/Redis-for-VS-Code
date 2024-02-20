import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import * as utils from 'uiSrc/utils'
import * as store from 'uiSrc/store'
import {
  useStringStore,
  initialState as initialStateInit,
  fetchString,
  updateStringValueAction,
  fetchDownloadStringValue,
} from '../useStringStore'

vi.spyOn(store, 'refreshKeyInfo')
vi.spyOn(utils, 'showErrorMessage')

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
  beforeEach(() => {
    vi.resetAllMocks()
  })
  it('fetchString success', async () => {
    const data = { keyName: constants.KEY_NAME_1, value: constants.KEY_1_VALUE }
    const responsePayload = { data, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchString(constants.KEY_NAME_1)
    await waitForStack()

    expect(useStringStore.getState().data.key).toEqual(constants.KEY_NAME_1)
    expect(useStringStore.getState().data.value).toEqual(constants.KEY_1_VALUE)
    expect(useStringStore.getState().loading).toEqual(false)
  })

  it('fetchString failed', async () => {
    apiService.post = vi.fn().mockRejectedValue(constants.AXIOS_ERROR)

    fetchString(constants.KEY_NAME_1)
    await waitForStack()

    expect(useStringStore.getState().data.key).toEqual('')
    expect(useStringStore.getState().data.value).toEqual(null)
    expect(utils.showErrorMessage).toBeCalled()
    expect(useStringStore.getState().loading).toEqual(false)
  })

  it('updateStringValueAction success', async () => {
    const data = { keyName: constants.KEY_NAME_1, value: constants.KEY_1_VALUE_2 }
    const responsePayload = { data, status: 200 }
    apiService.put = vi.fn().mockResolvedValue(responsePayload)

    updateStringValueAction(constants.KEY_NAME_1, constants.KEY_1_VALUE_2)
    await waitForStack()

    expect(store.refreshKeyInfo).toBeCalled()
    expect(useStringStore.getState().data.key).toEqual(constants.KEY_NAME_1)
    expect(useStringStore.getState().data.value).toEqual(constants.KEY_1_VALUE_2)
    expect(useStringStore.getState().loading).toEqual(false)
  })

  it('updateStringValueAction failed', async () => {
    apiService.put = vi.fn().mockRejectedValue(constants.AXIOS_ERROR)

    updateStringValueAction(constants.KEY_NAME_1, constants.KEY_1_VALUE_2)
    await waitForStack()

    expect(useStringStore.getState().data.key).toEqual('')
    expect(useStringStore.getState().data.value).toEqual(null)
    expect(store.refreshKeyInfo).not.toBeCalled()
    expect(utils.showErrorMessage).toBeCalled()
    expect(useStringStore.getState().loading).toEqual(false)
  })

  it('fetchDownloadStringValue success', async () => {
    const responsePayload = { status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchDownloadStringValue(constants.KEY_NAME_1)
    await waitForStack()

    expect(useStringStore.getState().loading).toEqual(false)
  })

  it('fetchDownloadStringValue failed', async () => {
    apiService.post = vi.fn().mockRejectedValue(constants.AXIOS_ERROR)

    fetchDownloadStringValue(constants.KEY_NAME_1)
    await waitForStack()

    expect(utils.showErrorMessage).toBeCalled()
    expect(useStringStore.getState().loading).toEqual(false)
  })
})

import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useHashStore,
  initialState as initialStateInit,
  fetchHashFields,
  fetchHashMoreFields,
  deleteHashFields,
  updateHashFieldsAction,
} from '../useHashStore'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants'

beforeEach(() => {
  useHashStore.setState((initialStateInit))
})

describe('useHashStore', () => {
  it('processHash', () => {
    // Arrange
    const { processHash } = useHashStore.getState()
    // Act
    processHash()
    // Assert
    expect(useHashStore.getState().loading).toEqual(true)
  })

  it('processHashFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useHashStore.setState((state) => ({ ...state, ...initialState }))

    const { processHashFinal } = useHashStore.getState()
    // Act
    processHashFinal()
    // Assert
    expect(useHashStore.getState().loading).toEqual(false)
  })
  it('processHashSuccess', () => {
    // Arrange
    const match = '123'
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useHashStore.setState((state) => ({ ...state, ...initialState }))

    const { processHashSuccess } = useHashStore.getState()
    // Act
    processHashSuccess(constants.HASH_DATA, match)
    // Assert
    expect(useHashStore.getState().data.match).toEqual(match)
    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.total).toEqual(constants.KEY_LENGTH_2)
    expect(useHashStore.getState().data.fields?.[0]?.field).toEqual(constants.KEY_2_FIELD)
    expect(useHashStore.getState().data.fields?.[0]?.value).toEqual(constants.KEY_2_VALUE)
  })
})

describe('async', () => {
  it('fetchHashFields', async () => {
    const data = constants.HASH_DATA
    const responsePayload = { data, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchHashFields(constants.KEY_NAME_2, 0 , 500, DEFAULT_SEARCH_MATCH)
    await waitForStack()

    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.fields?.[0]?.field).toEqual(constants.KEY_2_FIELD)
    expect(useHashStore.getState().data.fields?.[0]?.value).toEqual(constants.KEY_2_VALUE)
    expect(useHashStore.getState().loading).toEqual(false)
  })

  it('fetchHashMoreFields', async () => {
    useHashStore.setState(({ ...initialStateInit, data: constants.HASH_DATA}))
    const responsePayload = { data: { ...constants.HASH_DATA }, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchHashMoreFields(constants.KEY_NAME_2, 0 , 500, DEFAULT_SEARCH_MATCH)
    await waitForStack()

    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.fields?.[0]?.field).toEqual(constants.KEY_2_FIELD)
    expect(useHashStore.getState().data.fields?.[0]?.value).toEqual(constants.KEY_2_VALUE)
    expect(useHashStore.getState().data.fields?.[1]?.field).toEqual(constants.KEY_2_FIELD)
    expect(useHashStore.getState().data.fields?.[1]?.value).toEqual(constants.KEY_2_VALUE)
    expect(useHashStore.getState().loading).toEqual(false)
  })

  it('deleteHashFields', async () => {
    useHashStore.setState(({ ...initialStateInit, data: constants.HASH_DATA}))
    const responsePayload = { data: { affected: 1 }, status: 200 }
    apiService.delete = vi.fn().mockResolvedValue(responsePayload)

    deleteHashFields(constants.KEY_NAME_2, [constants.KEY_2_FIELD])
    await waitForStack()

    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.fields?.length).toEqual(0)
    expect(useHashStore.getState().loading).toEqual(false)
  })

  it('updateHashFieldsAction', async () => {
    useHashStore.setState(({ ...initialStateInit, data: constants.HASH_DATA}))
    const responsePayload = { data: { affected: 1 }, status: 200 }
    apiService.put = vi.fn().mockResolvedValue(responsePayload)

    updateHashFieldsAction({
      keyName: constants.KEY_NAME_3,
      fields: [{ field: constants.KEY_2_FIELD, value: constants.KEY_2_VALUE_2 }]
    })
    await waitForStack()

    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.fields?.[0].field).toEqual(constants.KEY_2_FIELD)
    expect(useHashStore.getState().data.fields?.[0].value).toEqual(constants.KEY_2_VALUE_2)
    expect(useHashStore.getState().loading).toEqual(false)
  })
})

import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import {
  useHashStore,
  initialState as initialStateInit,
  fetchHashFields,
  fetchHashMoreFields,
  deleteHashFields,
  updateHashFieldsAction,
  updateHashTTLAction,
} from '../useHashStore'

beforeEach(() => {
  useHashStore.setState((initialStateInit))
})

vi.spyOn(utils, 'showInformationMessage')

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
      keyName: constants.KEY_NAME_2,
      fields: [{ field: constants.KEY_2_FIELD, value: constants.KEY_2_VALUE_2 }]
    })
    await waitForStack()

    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.fields?.[0].field).toEqual(constants.KEY_2_FIELD)
    expect(useHashStore.getState().data.fields?.[0].value).toEqual(constants.KEY_2_VALUE_2)
    expect(useHashStore.getState().loading).toEqual(false)
  })

  it('updateHashTTLAction', async () => {
    useHashStore.setState(({ ...initialStateInit, data: constants.HASH_DATA}))
    const responsePayload = { status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    updateHashTTLAction({
      keyName: constants.KEY_NAME_2,
      fields: [{ field: constants.KEY_2_FIELD, expire: constants.KEY_2_FIELD_TTL_2 }]
    })
    await waitForStack()

    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.fields?.[0].field).toEqual(constants.KEY_2_FIELD)
    expect(useHashStore.getState().data.fields?.[0].value).toEqual(constants.KEY_2_VALUE)
    expect(useHashStore.getState().data.fields?.[0].expire).toEqual(constants.KEY_2_FIELD_TTL_2)
    expect(useHashStore.getState().loading).toEqual(false)
  })

  it('updateHashTTLAction should call showInformationMessage if expire = 0 and total = 1', async () => {
    useHashStore.setState(({
      ...initialStateInit,
      data: {
        ...constants.HASH_DATA,
        total: 1,
      }
    }))
    const responsePayload = { status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    updateHashTTLAction({
      keyName: constants.KEY_NAME_2,
      fields: [{ field: constants.KEY_2_FIELD, expire: constants.KEY_FIELD_TTL_ZERO }]
    })
    await waitForStack()

    expect(utils.showInformationMessage).toBeCalledWith(`${constants.KEY_NAME_HASH_2} has been deleted.`)
  })

  it('updateHashTTLAction should remove field if expire = 0 and total != 1', async () => {
    useHashStore.setState(({
      ...initialStateInit,
      data: {
        ...constants.HASH_DATA,
        total: 2,
      }
    }))
    const responsePayload = { status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    updateHashTTLAction({
      keyName: constants.KEY_NAME_2,
      fields: [{ field: constants.KEY_2_FIELD, expire: constants.KEY_FIELD_TTL_ZERO }]
    })
    await waitForStack()

    expect(useHashStore.getState().data.keyName).toEqual(constants.KEY_NAME_2)
    expect(useHashStore.getState().data.fields.length).toEqual(0)
    expect(useHashStore.getState().loading).toEqual(false)
  })
})

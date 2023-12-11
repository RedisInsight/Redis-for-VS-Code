import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import { DEFAULT_SEARCH_MATCH, SortOrder } from 'uiSrc/constants'
import {
  useZSetStore,
  initialState as initialStateInit,
  fetchZSetMembers,
  fetchZSetMoreMembers,
  deleteZSetMembers,
  updateZSetMembersAction,
} from '../useZSetStore'

beforeEach(() => {
  useZSetStore.setState(initialStateInit)
})

describe('useZSetStore', () => {
  it('processZSet', () => {
    // Arrange
    const { processZSet } = useZSetStore.getState()
    // Act
    processZSet()
    // Assert
    expect(useZSetStore.getState().loading).toEqual(true)
  })

  it('processZSetFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useZSetStore.setState((state) => ({ ...state, ...initialState }))

    const { processZSetFinal } = useZSetStore.getState()
    // Act
    processZSetFinal()
    // Assert
    expect(useZSetStore.getState().loading).toEqual(false)
  })
  it('processZSetSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useZSetStore.setState((state) => ({ ...state, ...initialState }))

    const { processZSetSuccess } = useZSetStore.getState()
    // Act
    processZSetSuccess(constants.ZSET_DATA)
    // Assert
    expect(useZSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_3)
    expect(useZSetStore.getState().data.total).toEqual(constants.KEY_LENGTH_3)
    expect(useZSetStore.getState().data.members?.[0]?.name).toEqual(constants.KEY_3_MEMBER)
    expect(useZSetStore.getState().data.members?.[0]?.score).toEqual(constants.KEY_3_SCORE)
  })
})

describe('async', () => {
  it('fetchZSetMembers', async () => {
    const data = constants.ZSET_DATA
    const responsePayload = { data, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchZSetMembers(constants.KEY_NAME_3, 0 , 500, SortOrder.ASC, DEFAULT_SEARCH_MATCH)
    await waitForStack()

    expect(useZSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_3)
    expect(useZSetStore.getState().data.members?.[0]?.name).toEqual(constants.KEY_3_MEMBER)
    expect(useZSetStore.getState().data.members?.[0]?.score).toEqual(constants.KEY_3_SCORE)
    expect(useZSetStore.getState().loading).toEqual(false)
  })

  it('fetchZSetMoreMembers', async () => {
    useZSetStore.setState(({ ...initialStateInit, data: constants.ZSET_DATA}))
    const responsePayload = { data: { ...constants.ZSET_DATA }, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchZSetMoreMembers(constants.KEY_NAME_3, 0 , 500, SortOrder.ASC, DEFAULT_SEARCH_MATCH)
    await waitForStack()

    expect(useZSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_3)
    expect(useZSetStore.getState().data.members?.[0]?.name).toEqual(constants.KEY_3_MEMBER)
    expect(useZSetStore.getState().data.members?.[0]?.score).toEqual(constants.KEY_3_SCORE)
    expect(useZSetStore.getState().data.members?.[1]?.name).toEqual(constants.KEY_3_MEMBER)
    expect(useZSetStore.getState().data.members?.[1]?.score).toEqual(constants.KEY_3_SCORE)
    expect(useZSetStore.getState().loading).toEqual(false)
  })

  it('deleteZSetMembers', async () => {
    useZSetStore.setState(({ ...initialStateInit, data: constants.ZSET_DATA}))
    const responsePayload = { data: { affected: 1 }, status: 200 }
    apiService.delete = vi.fn().mockResolvedValue(responsePayload)

    deleteZSetMembers(constants.KEY_NAME_3, [constants.KEY_3_MEMBER])
    await waitForStack()

    expect(useZSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_3)
    expect(useZSetStore.getState().data.members?.length).toEqual(0)
    expect(useZSetStore.getState().loading).toEqual(false)
  })

  it('updateZSetMembersAction', async () => {
    useZSetStore.setState(({ ...initialStateInit, data: constants.ZSET_DATA}))
    const responsePayload = { data: { affected: 1 }, status: 200 }
    apiService.put = vi.fn().mockResolvedValue(responsePayload)

    updateZSetMembersAction({
      keyName: constants.KEY_NAME_3,
      members: [{ name: constants.KEY_3_MEMBER, score: constants.KEY_3_SCORE_2 }]
    })
    await waitForStack()

    expect(useZSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_3)
    expect(useZSetStore.getState().data.members?.[0].name).toEqual(constants.KEY_3_MEMBER)
    expect(useZSetStore.getState().data.members?.[0].score).toEqual(constants.KEY_3_SCORE_2)
    expect(useZSetStore.getState().loading).toEqual(false)
  })
})

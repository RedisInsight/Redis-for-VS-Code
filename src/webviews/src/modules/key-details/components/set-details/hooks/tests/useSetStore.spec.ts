import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants'
import {
  useSetStore,
  initialState as initialStateInit,
  fetchSetMembers,
  fetchMoreSetMembers,
  deleteSetMembers,
  addSetMembersAction,
} from '../useSetStore'
import * as store from 'uiSrc/store'

vi.spyOn(store, 'refreshKeyInfo')

beforeEach(() => {
  useSetStore.setState(initialStateInit)
})

describe('useSetStore', () => {
  it('processSet', () => {
    // Arrange
    const { processSet } = useSetStore.getState()
    // Act
    processSet()
    // Assert
    expect(useSetStore.getState().loading).toEqual(true)
  })

  it('processSetFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useSetStore.setState((state) => ({ ...state, ...initialState }))

    const { processSetFinal } = useSetStore.getState()
    // Act
    processSetFinal()
    // Assert
    expect(useSetStore.getState().loading).toEqual(false)
  })

  it('loadSetMembersSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useSetStore.setState((state) => ({ ...state, ...initialState }))

    const { loadSetMembersSuccess } = useSetStore.getState()
    // Act
    loadSetMembersSuccess(constants.SET_DATA)
    // Assert
    expect(useSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_5)
    expect(useSetStore.getState().data.total).toEqual(constants.KEY_LENGTH_5)
    expect(useSetStore.getState().data.members?.[0]).toEqual(constants.KEY_5_MEMBER)
  })
})

describe('async', () => {
  it('fetchSetMembers', async () => {
    const data = constants.SET_DATA
    const responsePayload = { data, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchSetMembers(constants.KEY_NAME_5, 0 , 500, DEFAULT_SEARCH_MATCH)
    await waitForStack()

    expect(useSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_5)
    expect(useSetStore.getState().data.members?.[0]).toEqual(constants.KEY_5_MEMBER)
    expect(useSetStore.getState().loading).toEqual(false)
  })

  it('fetchMoreSetMembers', async () => {
    useSetStore.setState(({ ...initialStateInit, data: constants.SET_DATA}))
    const responsePayload = { data: { ...constants.SET_DATA }, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchMoreSetMembers(constants.KEY_NAME_5, 0 , 500, DEFAULT_SEARCH_MATCH)
    await waitForStack()

    expect(useSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_5)
    expect(useSetStore.getState().data.members?.[0]).toEqual(constants.KEY_5_MEMBER)
    expect(useSetStore.getState().data.members?.[1]).toEqual(constants.KEY_5_MEMBER_2)
    expect(useSetStore.getState().loading).toEqual(false)
  })

  it('deleteSetMembers', async () => {
    useSetStore.setState(({ ...initialStateInit, data: constants.SET_DATA}))
    const responsePayload = { data: { affected: 1 }, status: 200 }
    apiService.delete = vi.fn().mockResolvedValue(responsePayload)

    deleteSetMembers(constants.KEY_NAME_5, [constants.KEY_5_MEMBER])
    await waitForStack()

    expect(useSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_5)
    expect(useSetStore.getState().data.members?.length).toEqual(1)
    expect(useSetStore.getState().loading).toEqual(false)
  })

  it('addSetMembersAction', async () => {
    useSetStore.setState(({ ...initialStateInit, data: constants.SET_DATA}))
    const responsePayload = { data: { affected: 1 }, status: 200 }
    apiService.put = vi.fn().mockResolvedValue(responsePayload)

    addSetMembersAction({ keyName: constants.KEY_NAME_5, members: [constants.KEY_3_MEMBER] })

    await waitForStack()

    expect(store.refreshKeyInfo).toBeCalledWith(constants.KEY_NAME_5)
    expect(useSetStore.getState().data.keyName).toEqual(constants.KEY_NAME_5)
    expect(useSetStore.getState().loading).toEqual(false)
  })
})

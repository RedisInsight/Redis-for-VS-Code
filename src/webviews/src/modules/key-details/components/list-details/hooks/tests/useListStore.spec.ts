import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useListStore,
  initialState as initialStateInit,
  fetchListElements,
  fetchListMoreElements,
  updateListElementsAction,
  fetchSearchingListElement,
  insertListElementsAction,
  deleteListElementsAction,
} from '../useListStore'
import { ListElementDestination } from 'uiSrc/constants'
import * as store from 'uiSrc/store'

vi.spyOn(store, 'refreshKeyInfo')

beforeEach(() => {
  useListStore.setState(initialStateInit)
})

describe('useListStore', () => {
  it('processList', () => {
    // Arrange
    const { processList } = useListStore.getState()
    // Act
    processList()
    // Assert
    expect(useListStore.getState().loading).toEqual(true)
  })

  it('processListFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useListStore.setState((state) => ({ ...state, ...initialState }))

    const { processListFinal } = useListStore.getState()
    // Act
    processListFinal()
    // Assert
    expect(useListStore.getState().loading).toEqual(false)
  })
  it('processListSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useListStore.setState((state) => ({ ...state, ...initialState }))

    const { processListSuccess } = useListStore.getState()
    // Act
    processListSuccess(constants.LIST_DATA_RESPONSE)
    // Assert
    expect(useListStore.getState().data.keyName).toEqual(constants.KEY_NAME_4)
    expect(useListStore.getState().data.total).toEqual(constants.KEY_LENGTH_4)
    expect(useListStore.getState().data.elements?.[0]?.element).toEqual(constants.KEY_4_ELEMENT)
    expect(useListStore.getState().data.elements?.[0]?.index).toEqual(constants.KEY_4_INDEX)
    expect(useListStore.getState().data.elements?.[1]?.element).toEqual(constants.KEY_4_ELEMENT_2)
    expect(useListStore.getState().data.elements?.[1]?.index).toEqual(constants.KEY_4_INDEX_2)
  })

  it('processSearchListElement result not found', () => {
    const searchedIndex = 123
    useListStore.setState(({
      ...initialStateInit,
      data: { ...constants.LIST_DATA, searchedIndex }
    }))
    // Arrange
    const { processSearchListElement } = useListStore.getState()
    // Act
    processSearchListElement()
    // Assert
    expect(useListStore.getState().data.elements.length).toEqual(0)
    expect(useListStore.getState().data.searchedIndex).toEqual(searchedIndex)
  })
  it('processSearchListElement found', () => {
    const element = constants.LIST_DATA.elements[1]
    useListStore.setState(({ ...initialStateInit, data: constants.LIST_DATA}))
    // Arrange
    const { processSearchListElement } = useListStore.getState()
    // Act
    processSearchListElement(element)
    // Assert
    expect(useListStore.getState().data.elements.length).toEqual(1)
    expect(useListStore.getState().data.elements[0].element).toEqual(element.element)
    expect(useListStore.getState().data.elements[0].index).toEqual(element.index)
  })
})

describe('async', () => {
  it('fetchListElements', async () => {
    const data = constants.LIST_DATA_RESPONSE
    const responsePayload = { data, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchListElements(constants.KEY_NAME_4, 0 , 500)
    await waitForStack()

    expect(useListStore.getState().data.keyName).toEqual(constants.KEY_NAME_4)
    expect(useListStore.getState().data.elements?.[0]?.element).toEqual(constants.KEY_4_ELEMENT)
    expect(useListStore.getState().data.elements?.[0]?.index).toEqual(constants.KEY_4_INDEX)
    expect(useListStore.getState().data.elements?.[1]?.element).toEqual(constants.KEY_4_ELEMENT_2)
    expect(useListStore.getState().data.elements?.[1]?.index).toEqual(constants.KEY_4_INDEX_2)
    expect(useListStore.getState().loading).toEqual(false)
  })

  it('fetchListMoreElements', async () => {
    useListStore.setState(({
      ...initialStateInit,
      data: {
        ...constants.LIST_DATA,
        elements: [constants.LIST_DATA.elements[0]]
      }
    }))
    const responsePayload = { data: { ...constants.LIST_DATA_RESPONSE }, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchListMoreElements(constants.KEY_NAME_4, 0 , 500)
    await waitForStack()

    expect(useListStore.getState().data.keyName).toEqual(constants.KEY_NAME_4)
    expect(useListStore.getState().data.elements?.[0]?.element).toEqual(constants.KEY_4_ELEMENT)
    expect(useListStore.getState().data.elements?.[0]?.index).toEqual(constants.KEY_4_INDEX)
    expect(useListStore.getState().data.elements?.[1]?.element).toEqual(constants.KEY_4_ELEMENT)
    expect(useListStore.getState().data.elements?.[1]?.index).toEqual(1)
    expect(useListStore.getState().data.elements?.[2]?.element).toEqual(constants.KEY_4_ELEMENT_2)
    expect(useListStore.getState().loading).toEqual(false)
  })

  it('fetchSearchingListElement', async () => {
    useListStore.setState(({ ...initialStateInit, data: constants.LIST_DATA}))
    const responsePayload = { data: { value: constants.KEY_4_ELEMENT_2 }, status: 200 }
    apiService.post = vi.fn().mockResolvedValue(responsePayload)

    fetchSearchingListElement(constants.KEY_NAME_4, constants.KEY_4_INDEX_2)
    await waitForStack()

    expect(useListStore.getState().data.elements?.length).toEqual(1)
    expect(useListStore.getState().data.elements?.[0].element).toEqual(constants.KEY_4_ELEMENT_2)
    expect(useListStore.getState().data.elements?.[0].index).toEqual(constants.KEY_4_INDEX_2)
    expect(useListStore.getState().loading).toEqual(false)
  })

  it('updateListElementsAction', async () => {
    useListStore.setState(({ ...initialStateInit, data: constants.LIST_DATA}))
    const responsePayload = { data: { affected: 1 }, status: 200 }
    apiService.patch = vi.fn().mockResolvedValue(responsePayload)

    updateListElementsAction({
      keyName: constants.KEY_NAME_4,
      element: constants.KEY_4_ELEMENT,
      index: constants.KEY_4_INDEX_2,
    })
    await waitForStack()

    expect(useListStore.getState().data.keyName).toEqual(constants.KEY_NAME_4)
    expect(useListStore.getState().data.elements?.[1].element).toEqual(constants.KEY_4_ELEMENT)
    expect(useListStore.getState().data.elements?.[1].index).toEqual(constants.KEY_4_INDEX_2)
    expect(useListStore.getState().loading).toEqual(false)
  })

  it('insertListElementsAction', async () => {
    useListStore.setState(({ ...initialStateInit, data: constants.LIST_DATA}))
    const responsePayload = { status: 200 }
    apiService.put = vi.fn().mockResolvedValue(responsePayload)

    insertListElementsAction({
      keyName: constants.KEY_NAME_4,
      elements: [constants.KEY_4_ELEMENT],
      destination: ListElementDestination.Head,
    })
    await waitForStack()

    expect(useListStore.getState().data.keyName).toEqual(constants.KEY_NAME_4)
    expect(store.refreshKeyInfo).toBeCalledWith(constants.KEY_NAME_4, true)
    expect(useListStore.getState().loading).toEqual(false)
  })

  it('deleteListElementsAction', async () => {
    useListStore.setState(({ ...initialStateInit, data: constants.LIST_DATA}))
    const responsePayload = { data: {}, status: 200 }
    apiService.delete = vi.fn().mockResolvedValue(responsePayload)

    deleteListElementsAction({
      keyName: constants.KEY_NAME_4,
      count: 2,
      destination: ListElementDestination.Head,
    })
    await waitForStack()

    expect(useListStore.getState().data.keyName).toEqual(constants.KEY_NAME_4)
    expect(store.refreshKeyInfo).toBeCalledWith(constants.KEY_NAME_4, true)
    expect(useListStore.getState().loading).toEqual(false)
  })
})

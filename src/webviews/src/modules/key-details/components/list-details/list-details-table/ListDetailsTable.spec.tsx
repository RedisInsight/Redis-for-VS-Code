import React from 'react'
import { mock } from 'ts-mockito'
import { useSelectedKeyStore } from 'uiSrc/store'
import { act, constants, fireEvent, render, screen } from 'testSrc/helpers'
import { ListDetailsTable, Props } from './ListDetailsTable'
import { useListStore } from '../hooks/useListStore'

const mockedProps = mock<Props>()

const initialListState = { data: constants.LIST_DATA }
beforeEach(() => {
  useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
  useListStore.setState((state) => ({ ...state, ...initialListState }))
})

describe('ListDetailsTable', () => {
  it('should render', () => {
    expect(render(<ListDetailsTable {...mockedProps} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<ListDetailsTable {...mockedProps} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]',
    )
    expect(rows).toHaveLength(initialListState.data?.elements?.length)
  })

  it('should render search input', () => {
    render(<ListDetailsTable {...mockedProps} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<ListDetailsTable {...mockedProps} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: '111' } })
    expect(searchInput).toHaveValue('111')
  })

  it('should render editor after click edit button', async () => {
    const { debug } = render(<ListDetailsTable {...mockedProps} />)
    await act(() => {
      fireEvent.click(screen.getAllByTestId(/edit-list-button/)[0])
    })

    debug()
    expect(screen.getByTestId('element-value-editor')).toBeInTheDocument()
  })

  it('should render resize trigger for index column', () => {
    render(<ListDetailsTable {...mockedProps} />)
    expect(screen.getByTestId('resize-trigger-index')).toBeInTheDocument()
  })

  // describe.todo('decompressed  data', () => {
  //   it('should render decompressed GZIP data = "1"', () => {
  //     const defaultState = await vi.importActual<object>('uiSrc/slices/browser/list').initialState
  //     const listDataSelectorMock = vi.fn().mockReturnValue({
  //       ...defaultState,
  //       key: '123zxczxczxc',
  //       elements: [
  //         { element: anyToBuffer(GZIP_COMPRESSED_VALUE_1), index: 0 },
  //       ],
  //     })
  //     listDataSelector.mockImplementation(listDataSelectorMock)

  //     const { queryByTestId } = render(<ListDetailsTable {...(mockedProps)} />)
  //     const elementEl = queryByTestId(/list-element-value-/)

  //     expect(elementEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
  //   })

  //   it('edit button should be disabled if data was compressed', async () => {
  //     const defaultState = await vi.importActual<object>('uiSrc/slices/browser/list').initialState
  //     const listDataSelectorMock = vi.fn().mockReturnValue({
  //       ...defaultState,
  //       key: '123zxczxczxc',
  //       elements: [
  //         { element: anyToBuffer(GZIP_COMPRESSED_VALUE_1), index: 0 },
  //       ],
  //     })
  //     listDataSelector.mockImplementation(listDataSelectorMock)

  //     connectedInstanceSelector.mockImplementation(() => ({
  //       compressor: KeyValueCompressor.GZIP,
  //     }))

  //     const { queryByTestId } = render(<ListDetailsTable {...(mockedProps)} />)
  //     const editBtn = queryByTestId(/edit-list-button-/)

  //     fireEvent.click(editBtn)

  //     await act(async () => {
  //       fireEvent.mouseOver(editBtn)
  //     })
  //     await waitForEuiToolTipVisible()

  //     expect(editBtn).toBeDisabled()
  //     expect(screen.getByTestId('list-edit-tooltip')).toHaveTextContent(TEXT_DISABLED_COMPRESSED_VALUE)
  //     expect(queryByTestId('list-value-editor')).not.toBeInTheDocument()
  //   })
  // })
})

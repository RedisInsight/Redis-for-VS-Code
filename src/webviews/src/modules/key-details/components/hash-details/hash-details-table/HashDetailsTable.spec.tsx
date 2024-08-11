import React from 'react'
import { instance, mock } from 'ts-mockito'
import { bufferToString } from 'uiSrc/utils'
import * as useSelectedKeyStore from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { constants, fireEvent, render, screen } from 'testSrc/helpers'
import { HashDetailsTable, Props } from './HashDetailsTable'
import { useHashStore } from '../hooks/useHashStore'

const mockedProps = mock<Props>()

const initialHashState = { data: constants.HASH_DATA }
beforeEach(() => {
  useSelectedKeyStore.useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
  useHashStore.setState((state) => ({ ...state, ...initialHashState }))
})

describe('HashDetailsTable', () => {
  it('should render', () => {
    expect(render(<HashDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<HashDetailsTable {...instance(mockedProps)} />)
    const rows = container.querySelectorAll('.ReactVirtualized__Table__row[role="row"]')
    expect(rows).toHaveLength(initialHashState.data?.fields?.length)
  })

  it('should render search input', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(
      searchInput,
      { target: { value: '*1*' } },
    )
    expect(searchInput).toHaveValue('*1*')
  })

  it('should render delete popup after click remove button', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/remove-hash-button/)[0])
    const popupEl = screen.getByTestId(
      `remove-hash-button-${bufferToString(initialHashState.data?.fields[0].field)}-trigger`,
    )
    expect(popupEl).toBeInTheDocument()
  })

  it('should render editor after click edit button', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    fireEvent.mouseOver(screen.getAllByTestId(/hash_content-value-field/)[0])

    fireEvent.click(screen.getAllByTestId(/hash_edit-btn-field/)[0])
    expect(screen.getByTestId('hash_value-editor-field')).toBeInTheDocument()
  })

  it('should call setSelectedKeyRefreshDisabled after click edit button', () => {
    const setSelectedKeyRefreshDisabledMock = vi.fn()
    const spy = vi.spyOn(useSelectedKeyStore, 'useSelectedKeyStore').mockImplementation(() => ({
      setRefreshDisabled: setSelectedKeyRefreshDisabledMock,
    }))

    render(<HashDetailsTable {...instance(mockedProps)} />)
    fireEvent.mouseOver(screen.getAllByTestId(/hash_content-value-field/)[0])
    fireEvent.click(screen.getAllByTestId(/hash_edit-btn-field/)[0])
    expect(setSelectedKeyRefreshDisabledMock).toBeCalledWith(true)
    spy.mockRestore()
  })

  it('should render resize trigger for field column', () => {
    render(<HashDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('resize-trigger-field')).toBeInTheDocument()
  })

  // describe.todo('decompressed  data', () => {
  //   it('should render decompressed GZIP data', () => {
  //     const defaultState = await vi.importActual<object>('uiSrc/slices/browser/hash').initialState
  //     const hashDataSelectorMock = vi.fn().mockReturnValue({
  //       ...defaultState,
  //       total: 1,
  //       key: '123zxczxczxc',
  //       fields: [
  //         { field: anyToBuffer(GZIP_COMPRESSED_VALUE_1), value: anyToBuffer(GZIP_COMPRESSED_VALUE_2) },
  //       ],
  //     })
  //     hashDataSelector.mockImplementation(hashDataSelectorMock)

  //     const { queryByTestId, queryAllByTestId } = render(<HashDetailsTable {...instance(mockedProps)} />)
  //     const fieldEl = queryAllByTestId(/hash-field-/)?.[0]
  //     const valueEl = queryByTestId(/hash-field-value/)

  //     expect(fieldEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
  //     expect(valueEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_2)
  //   })

  //   it('edit button should be disabled if data was compressed', async () => {
  //     const defaultState = await vi.importActual<object>('uiSrc/slices/browser/hash').initialState
  //     const hashDataSelectorMock = vi.fn().mockReturnValue({
  //       ...defaultState,
  //       total: 1,
  //       key: '123zxczxczxc',
  //       fields: [
  //         { field: anyToBuffer(GZIP_COMPRESSED_VALUE_1), value: anyToBuffer(GZIP_COMPRESSED_VALUE_2) },
  //       ],
  //     })
  //     hashDataSelector.mockImplementation(hashDataSelectorMock)

  //     connectedInstanceSelector.mockImplementation(() => ({
  //       compressor: KeyValueCompressor.GZIP,
  //     }))

  //     const { queryByTestId } = render(<HashDetailsTable {...instance(mockedProps)} />)
  //     const editBtn = queryByTestId(/hash_edit-btn-field/)

  //     fireEvent.click(editBtn)

  //     await waitFor(async () => {
  //       fireEvent.mouseOver(editBtn)
  //     })
  //     await waitForEuiToolTipVisible()

  //     expect(editBtn).toBeDisabled()
  //     expect(screen.getByTestId('hash-edit-tooltip')).toHaveTextContent(TEXT_DISABLED_COMPRESSED_VALUE)
  //     expect(queryByTestId('hash-value-editor')).not.toBeInTheDocument()
  //   })
  // })
})

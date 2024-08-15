import React from 'react'
import { instance, mock } from 'ts-mockito'
import * as useSelectedKeyStore from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { render, screen, fireEvent, constants } from 'testSrc/helpers'
import { ZSetDetailsTable, Props } from './ZSetDetailsTable'
import { useZSetStore } from '../hooks/useZSetStore'

const mockedProps = mock<Props>()

const initialZSetState = { data: constants.ZSET_DATA }
beforeEach(() => {
  useSelectedKeyStore.useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
  useZSetStore.setState((state) => ({ ...state, ...initialZSetState }))
})

describe('ZSetDetailsTable', () => {
  it('should render', () => {
    expect(render(<ZSetDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render search input', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeTruthy()
  })

  it('should call search', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(
      searchInput,
      { target: { value: '*' } },
    )
    expect(searchInput).toHaveValue('*')
  })

  it('should render editor after click edit button', () => {
    const { queryByTestId } = render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(queryByTestId(/inline-item-editor/)!).not.toBeInTheDocument()

    fireEvent.mouseOver(screen.getAllByTestId(/zset_content-value/)[0])

    fireEvent.click(screen.getAllByTestId(/zset_edit-btn/)[0])
    expect(screen.getByTestId(/inline-item-editor/)).toBeInTheDocument()
  })

  it.todo('should render disabled edit button', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    fireEvent.mouseOver(screen.getAllByTestId(/zset_content-value/)[0])
    expect(screen.getByTestId(/zset_edit-btn-4/)).toBeDisabled()
  })

  it('should render enabled edit button', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    fireEvent.mouseOver(screen.getAllByTestId(/zset_content-value/)[0])
    expect(screen.getByTestId(/zset_edit-btn/)).not.toBeDisabled()
  })

  it('should render editor after click edit button and able to change value', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    fireEvent.mouseOver(screen.getAllByTestId(/zset_content-value/)[0])
    fireEvent.click(screen.getAllByTestId(/zset_edit-btn/)[0])
    expect(screen.getByTestId('inline-item-editor')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('inline-item-editor'), { target: { value: '123' } })
    expect(screen.getByTestId('inline-item-editor')).toHaveValue('123')
  })

  it('should call setSelectedKeyRefreshDisabled after click edit button', () => {
    const setSelectedKeyRefreshDisabledMock = vi.fn()
    const spy = vi.spyOn(useSelectedKeyStore, 'useSelectedKeyStore').mockImplementation(() => ({
      setRefreshDisabled: setSelectedKeyRefreshDisabledMock,
    }))

    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    fireEvent.mouseOver(screen.getAllByTestId(/zset_content-value/)[0])
    fireEvent.click(screen.getAllByTestId(/zset_edit-btn/)[0])
    expect(setSelectedKeyRefreshDisabledMock).toBeCalledWith(true)
    spy.mockRestore()
  })

  it('should render resize trigger for name column', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('resize-trigger-name')).toBeInTheDocument()
  })

  // describe.todo('decompressed data', () => {
  //   it('should render decompressed GZIP data = "1"', async () => {
  //     const defaultState = (await vi.importActual<object>('uiSrc/slices/browser/zset')).initialState
  //     const zsetDataSelectorMock = vi.fn().mockReturnValue({
  //       ...defaultState,
  //       key: '123zxczxczxc',
  //       members: [
  //         { name: anyToBuffer(GZIP_COMPRESSED_VALUE_1), score: 1 },
  //       ],
  //     })
  //     zsetDataSelector.mockImplementation(zsetDataSelectorMock)

  //     const { queryByTestId } = render(<ZSetDetailsTable {...instance(mockedProps)} />)
  //     const memberEl = queryByTestId(/zset-member-value-/)

  //     expect(memberEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
  //   })
  // })
})

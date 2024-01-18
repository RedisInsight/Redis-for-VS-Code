import React from 'react'
import { instance, mock } from 'ts-mockito'
import { useSelectedKeyStore } from 'uiSrc/store'
import { render, screen, fireEvent, constants } from 'testSrc/helpers'
import { SetDetailsTable, Props } from './SetDetailsTable'
import { useSetStore } from '../hooks/useSetStore'

const members = [
  { type: 'Buffer', data: [49] },
  { type: 'Buffer', data: [50] },
  { type: 'Buffer', data: [51] },
]

const mockedProps = mock<Props>()

beforeEach(() => {
  useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
  useSetStore.setState((state) => ({ ...state, data: { ...state.data, members } }))
})

describe('SetDetailsTable', () => {
  it('should render', () => {
    expect(render(<SetDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<SetDetailsTable {...instance(mockedProps)} />)
    const rows = container.querySelectorAll('.ReactVirtualized__Table__row[role="row"]')
    expect(rows).toHaveLength(members.length)
  })

  it('should render search input', () => {
    render(<SetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeTruthy()
  })

  it('should call search', () => {
    render(<SetDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(
      searchInput,
      { target: { value: '*1*' } },
    )
    expect(searchInput).toHaveValue('*1*')
  })

  it('should render delete popup after click remove button', () => {
    render(<SetDetailsTable {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/set-remove-button/i)[0])
    expect(screen.getAllByTestId(/set-remove-button-/i)[0]).toBeInTheDocument()
  })

  // describe.todo('decompressed  data', () => {
  //   it('should render decompressed GZIP data = "1"', () => {
  //     const defaultState = await vi.importActual<object>('uiSrc/slices/browser/set').initialState
  //     const setDataSelectorMock = vi.fn().mockReturnValue({
  //       ...defaultState,
  //       key: '123zxczxczxc',
  //       members: [
  //         anyToBuffer(GZIP_COMPRESSED_VALUE_1),
  //       ],
  //     })
  //     setDataSelector.mockImplementation(setDataSelectorMock)

  //     const { queryByTestId } = render(<SetDetailsTable {...instance(mockedProps)} />)
  //     const memberEl = queryByTestId(/set-member-value-/)

  //     expect(memberEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
  //   })
  // })
})

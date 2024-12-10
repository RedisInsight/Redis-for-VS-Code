import React from 'react'

import { render, constants } from 'testSrc/helpers'
import { KeysTreeHeader } from './KeysTreeHeader'
import * as useKeys from '../../hooks/useKeys'

const useKeysInContextMock = vi.spyOn(useKeys, 'useKeysInContext')

const mockDatabase = constants.DATABASE
const mockedProps: Props = {
  database: mockDatabase,
  total: 1,
  scanned: 1,
  showTree: true,
  resultsLength: 1,
  loading: false,
  toggleShowTree: () => {},
}

describe('KeysTreeHeaders', () => {
  it('should render', () => {
    expect(render(<KeysTreeHeader {...mockedProps} />)).toBeTruthy()
  })

  it.skip('should hide Scan more button when totalItemsCount < scanned', () => {
    const initialState = { scanned: 2, total: 1 }
    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader {...mockedProps} />)

    expect(queryByTestId('scan-more')).not.toBeInTheDocument()
  })

  it('should show Scan more button when totalItemsCount > scanned ', () => {
    const initialState = { scanned: 1, total: 2 }

    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader {...mockedProps} />)

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should show Scan more button when total=null ', () => {
    const initialState = { scanned: 1, total: null }

    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader {...mockedProps} />)

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should show Scan more button when nextCursor!="0" ', () => {
    const initialState = { scanned: 3, total: 2, nextCursor: '1' }

    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader {...mockedProps} />)

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })
})

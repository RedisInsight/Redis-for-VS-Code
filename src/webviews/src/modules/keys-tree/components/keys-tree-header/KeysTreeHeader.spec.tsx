import React from 'react'

import { render } from 'testSrc/helpers'
import { KeysTreeHeader } from './KeysTreeHeader'
import * as useKeys from '../../hooks/useKeys'

const useKeysInContextMock = vi.spyOn(useKeys, 'useKeysInContext')

describe('KeysTreeHeaders', () => {
  it('should render', () => {
    expect(render(<KeysTreeHeader />)).toBeTruthy()
  })

  it.skip('should hide Scan more button when totalItemsCount < scanned', () => {
    const initialState = { scanned: 2, total: 1 }
    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader />)

    expect(queryByTestId('scan-more')).not.toBeInTheDocument()
  })

  it('should show Scan more button when totalItemsCount > scanned ', () => {
    const initialState = { scanned: 1, total: 2 }

    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader />)

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should show Scan more button when total=null ', () => {
    const initialState = { scanned: 1, total: null }

    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader />)

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should show Scan more button when nextCursor!="0" ', () => {
    const initialState = { scanned: 3, total: 2, nextCursor: '1' }

    useKeysInContextMock.mockImplementation(() => initialState)

    const { queryByTestId } = render(<KeysTreeHeader />)

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })
})

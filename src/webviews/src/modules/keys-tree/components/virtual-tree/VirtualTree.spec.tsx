import React from 'react'
import { mock, instance } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import VirtualTree, { Props } from './VirtualTree'

const mockedItems = [
  {
    name: 'test',
    type: 'hash',
    ttl: 2147474450,
    size: 3041,
  },
]

const mockedProps = {
  ...instance(mock<Props>()),
  items: mockedItems,
}

// const mockVirtualTreeResult = [{
//   children: [{
//     children: [],
//     fullName: 'car:110:',
//     id: '0.snc1rc3zwgo',
//     keyApproximate: 0.01,
//     keyCount: 1,
//     name: '110',
//   }],
//   fullName: 'car:',
//   id: '0.sz1ie1koqi8',
//   keyApproximate: 47.18,
//   keyCount: 4718,
//   name: 'car',
// },
// {
//   children: [],
//   fullName: 'test',
//   id: '0.snc1rc3zwg1o',
//   keyApproximate: 0.01,
//   keyCount: 1,
//   name: 'test',
// }]

// vi.mock('uiSrc/services', () => ({
//   ...(await vi.importActual('uiSrc/services'),
//   useDisposableWebworker: () => ({ result: mockVirtualTreeResult, run: vi.fn() }),
// }))

describe('VirtualTree', () => {
  it('should render with empty nodes', () => {
    expect(render(<VirtualTree {...mockedProps} />)).toBeTruthy()
  })

  it('should render Spinner with empty nodes and loading', () => {
    const mockFn = vi.fn()
    const { queryByTestId } = render(
      <VirtualTree
        {...mockedProps}
        loading
        setConstructingTree={mockFn}
      />,
    )

    expect(queryByTestId('virtual-tree-spinner')).toBeInTheDocument()
  })

  it.todo('should render items', async () => {
    const mockFn = vi.fn()
    const { queryByTestId } = render(
      <VirtualTree
        {...mockedProps}
        setConstructingTree={mockFn}
      />,
    )

    expect(queryByTestId('node-item_test')).toBeInTheDocument()
  })
})

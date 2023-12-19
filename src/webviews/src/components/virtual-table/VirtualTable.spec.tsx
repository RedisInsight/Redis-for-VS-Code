import React from 'react'
import { mock, instance } from 'ts-mockito'

import { SortOrder } from 'uiSrc/constants'
import { fireEvent, render, screen } from 'testSrc/helpers'

import { VirtualTable } from './VirtualTable'
import { IProps, ITableColumn } from './interfaces'

const mockedProps = mock<IProps>()

const columns: ITableColumn[] = [
  {
    id: 'name',
    label: 'Member',
    isSearchable: true,
    staySearchAlwaysOpen: true,
    initialSearchValue: '',
    truncateText: true,
  },
]

const sortedColumn = {
  column: 'name',
  order: SortOrder.ASC,
}

const members = ['member1', 'member2']

describe('VirtualTable', () => {
  it('should render with empty rows', () => {
    expect(
      render(
        <VirtualTable
          {...instance(mockedProps)}
          items={[]}
          columns={columns}
          loading={false}
          loadMoreItems={vi.fn()}
          totalItemsCount={members.length}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render rows', () => {
    expect(
      render(
        <VirtualTable
          {...instance(mockedProps)}
          items={members}
          columns={columns}
          loading={false}
          loadMoreItems={vi.fn()}
          totalItemsCount={members.length}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render search', () => {
    render(
      <VirtualTable
        {...instance(mockedProps)}
        items={members}
        columns={columns}
        loading={false}
        loadMoreItems={vi.fn()}
        totalItemsCount={members.length}
      />,
    )
    const searchInput = screen.getByTestId('search')
    expect(searchInput).toBeInTheDocument()
  })

  it('should open search clicked by search button', () => {
    const updatedColumns = [
      {
        ...columns[0],
        staySearchAlwaysOpen: false,
      },
    ]
    render(
      <VirtualTable
        {...instance(mockedProps)}
        items={members}
        columns={updatedColumns}
        loading={false}
        loadMoreItems={vi.fn()}
        totalItemsCount={members.length}
      />,
    )
    const searchInput = screen.getByTestId('search')
    expect(searchInput).not.toBeVisible()
    const searchButton = screen.getByTestId('search-button')
    fireEvent.click(searchButton)
    expect(searchInput).toBeVisible()
  })

  it('should call sort column', async () => {
    const updatedColumns = [
      {
        ...columns[0],
        isSortable: true,
        isSearchable: false,
      },
    ]
    const onChangeSorting = vi.fn()
    const { findByTestId } = render(
      <VirtualTable
        {...instance(mockedProps)}
        items={members}
        columns={updatedColumns}
        loading={false}
        loadMoreItems={vi.fn()}
        totalItemsCount={members.length}
        sortedColumn={sortedColumn}
        onChangeSorting={onChangeSorting}
      />,
    )

    // fireEvent.click(container.querySelector('.headerButtonSorted') as Element)
    fireEvent.click(await findByTestId('sort-button'))

    expect(onChangeSorting).toBeCalled()
  })

  it('should call onRowClick by clicking row', () => {
    const onRowClick = vi.fn()
    render(
      <VirtualTable
        {...instance(mockedProps)}
        items={members}
        columns={columns}
        loading={false}
        loadMoreItems={vi.fn()}
        totalItemsCount={members.length}
        onRowClick={onRowClick}
      />,
    )
    const firstRow = screen.getAllByLabelText(/row/)[0]
    fireEvent.click(firstRow)

    expect(onRowClick).toBeCalled()
  })

  it('should show resize trigger for resizable column', () => {
    const updatedColumns = [
      {
        ...columns[0],
        isResizable: true,
      },
    ]

    render(
      <VirtualTable
        {...instance(mockedProps)}
        items={members}
        columns={updatedColumns}
        loading={false}
        loadMoreItems={vi.fn()}
        totalItemsCount={members.length}
      />,
    )

    expect(screen.getByTestId('resize-trigger-name')).toBeInTheDocument()
  })
})

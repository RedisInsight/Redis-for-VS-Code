import React from 'react'
import { instance, mock } from 'ts-mockito'
import { screen, fireEvent } from '@testing-library/react'
import { composeStories } from '@storybook/react'
import { describe, it, vi } from 'vitest'

import { render } from 'testSrc/helpers'
import { Props, ScanMore } from './ScanMore'
import * as stories from './ScanMore.stories'

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Hidden, Default } = composeStories(stories)

const scanMoreBtn = 'scan-more'
const mockedProps = mock<Props>()

describe('ScanMore', () => {
  it('should render', () => {
    expect(render(<ScanMore {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('render Default story', () => {
    const { queryByTestId } = render(<Default />)
    expect(queryByTestId(scanMoreBtn)).toBeInTheDocument()
  })

  it('render Hidden button from stories', () => {
    const { queryByTestId } = render(<Hidden />)
    expect(queryByTestId(scanMoreBtn)).not.toBeInTheDocument()
  })

  it('should call "loadMoreItems"', () => {
    const handleClick = vi.fn()

    const renderer = render(
      <ScanMore {...instance(mockedProps)} loadMoreItems={handleClick} scanned={1} totalItemsCount={2} />,
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId('scan-more'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should show button when totalItemsCount < scanned and nextCursor is not zero', () => {
    const { queryByTestId } = render(
      <ScanMore {...instance(mockedProps)} scanned={2} totalItemsCount={1} nextCursor="123" />,
    )

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should hide button when totalItemsCount < scanned and nextCursor is zero', () => {
    const { queryByTestId } = render(
      <ScanMore {...instance(mockedProps)} scanned={2} totalItemsCount={1} nextCursor="0" />,
    )

    expect(queryByTestId('scan-more')).not.toBeInTheDocument()
  })
  it('should button be shown when totalItemsCount > scanned ', () => {
    const { queryByTestId } = render(
      <ScanMore {...instance(mockedProps)} scanned={1} totalItemsCount={2} />,
    )

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })
})

import React from 'react'
import { instance, mock } from 'ts-mockito'
import { screen, fireEvent } from '@testing-library/react'
import { composeStories } from '@storybook/react'
import { describe, it, vi } from 'vitest'

import { render } from 'testSrc/helpers'
import { Props, ScanMore } from './ScanMore'
import * as stories from './ScanMore.stories'

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Default } = composeStories(stories)

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

  it('should call "loadMoreItems"', () => {
    const handleClick = vi.fn()

    const renderer = render(
      <ScanMore {...instance(mockedProps)} loadMoreItems={handleClick} />,
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId('scan-more'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled', () => {
    const handleClick = vi.fn()

    const renderer = render(
      <ScanMore {...instance(mockedProps)} disabled loadMoreItems={handleClick} />,
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId('scan-more'))
    expect(handleClick).toHaveBeenCalledTimes(0)
  })
})

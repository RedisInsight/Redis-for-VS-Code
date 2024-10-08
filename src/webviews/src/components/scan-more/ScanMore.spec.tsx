import React from 'react'
import { instance, mock } from 'ts-mockito'
import { screen, fireEvent } from '@testing-library/react'
import { describe, it, vi } from 'vitest'

import { render } from 'testSrc/helpers'
import { Props, ScanMore } from './ScanMore'

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const mockedProps = mock<Props>()

describe('ScanMore', () => {
  it('should render', () => {
    expect(render(<ScanMore {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call "loadMoreItems"', () => {
    const handleClick = vi.fn()

    const renderer = render(
      <ScanMore {...instance(mockedProps)} loadMoreItems={handleClick} />,
    )

    expect(renderer).toBeTruthy()

    const button = screen.getByTestId('scan-more') as HTMLButtonElement
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(button.disabled).toBe(false)
  })

  it('should be disabled', () => {
    const handleClick = vi.fn()

    const renderer = render(
      <ScanMore {...instance(mockedProps)} disabled loadMoreItems={handleClick} />,
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId('scan-more'))

    const button = screen.getByTestId('scan-more') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})

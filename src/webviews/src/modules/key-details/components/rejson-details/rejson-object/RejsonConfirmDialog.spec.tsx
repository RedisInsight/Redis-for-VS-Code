import React from 'react'
import { fireEvent } from '@testing-library/react'
import { render, screen } from 'testSrc/helpers'

import ReJSONConfirmDialog from './RejsonConfirmDialog'

describe('ReJSONConfirmDialog', () => {
  it('should not render when open is false', () => {
    render(
      <ReJSONConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(
      screen.queryByText('Duplicate JSON key detected'),
    ).not.toBeInTheDocument()
  })

  it('should render when open is true', () => {
    render(
      <ReJSONConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} />,
    )

    expect(screen.getByText('Duplicate JSON key detected')).toBeInTheDocument()
    expect(
      screen.getByText('You already have the same JSON key.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'If you proceed, a value of the existing JSON key will be overwritten.',
      ),
    ).toBeInTheDocument()
  })

  it('should call onConfirm when Overwrite button is clicked', () => {
    const onConfirm = vi.fn()

    render(
      <ReJSONConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    fireEvent.click(screen.getByTestId('confirm-btn'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()

    render(
      <ReJSONConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} />,
    )

    fireEvent.click(screen.getByTestId('cancel-btn'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close (x in the corner) is clicked', () => {
    const onClose = vi.fn()

    render(
      <ReJSONConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} />,
    )

    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

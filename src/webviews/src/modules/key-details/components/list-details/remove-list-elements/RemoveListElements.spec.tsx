import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Mock } from 'vitest'

import { HEAD_DESTINATION, TAIL_DESTINATION } from 'uiSrc/constants'
import * as useDatabases from 'uiSrc/store/hooks/use-databases-store/useDatabasesStore'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { Props, RemoveListElements } from './RemoveListElements'

const COUNT_INPUT = 'count-input'

const mockedProps = mock<Props>()

describe('RemoveListElements', () => {
  it('should render', () => {
    expect(
      render(<RemoveListElements {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should set count input properly', () => {
    render(<RemoveListElements {...instance(mockedProps)} />)
    const countInput = screen.getByTestId(COUNT_INPUT)
    fireEvent.change(countInput, { target: { value: '123' } })
    expect(countInput).toHaveValue('123')
  })

  it('should render destination properly', async () => {
    render(<RemoveListElements {...instance(mockedProps)} />)

    expect(screen.queryByTestId(HEAD_DESTINATION)).toBeInTheDocument()
    expect(screen.queryByTestId(TAIL_DESTINATION)).toBeInTheDocument()
  })

  it('should show remove popover', () => {
    render(<RemoveListElements {...instance(mockedProps)} />)
    const countInput = screen.getByTestId(COUNT_INPUT)
    fireEvent.change(countInput, { target: { value: '123' } })
    fireEvent.click(screen.getByTestId('remove-elements-btn-trigger'))
    expect(screen.getByTestId('remove-elements-btn')).toBeInTheDocument()
  })

  describe('redis version 5.1', () => {
    beforeAll(() => {
      (vi.spyOn(useDatabases, 'useDatabasesStore') as Mock).mockImplementation(() => ({
        databaseVersion: '5.1',
      }))
    })
    afterAll(() => {
      vi.restoreAllMocks()
    })
    it('should be disabled count with database redis version < 6.2', () => {
      render(<RemoveListElements {...instance(mockedProps)} />)
      const countInput = screen.getByTestId(COUNT_INPUT)
      fireEvent.change(countInput, { target: { value: '123' } })
      expect(countInput).toBeDisabled()
    })

    it('should be info box with database redis version < 6.2', () => {
      render(<RemoveListElements {...instance(mockedProps)} />)
      expect(screen.getByTestId('info-tooltip-icon')).toBeInTheDocument()
    })
  })
})

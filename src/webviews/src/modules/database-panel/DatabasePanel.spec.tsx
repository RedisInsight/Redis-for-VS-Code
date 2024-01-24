import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'testSrc/helpers'
import { Props, DatabasePanel } from './DatabasePanel'

const mockedProps = mock<Props>()

describe('DatabasePanel', () => {
  it('should render', () => {
    expect(
      render(<DatabasePanel {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it.todo('should render instance types after click on auto discover', () => {
    render(<DatabasePanel {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-auto'))
    expect(screen.getByTestId('db-types')).toBeInTheDocument()
  })
})

import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'testSrc/helpers'
import { Props, DatabaseConnections } from './DatabaseConnections'

const mockedProps = mock<Props>()

describe('DatabaseConnections', () => {
  it('should render', () => {
    expect(
      render(<DatabaseConnections {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it.todo('should call changeConnectionType after change connection type', () => {
    const changeConnectionType = vi.fn()
    render(<DatabaseConnections {...instance(mockedProps)} changeConnectionType={changeConnectionType} />)
    fireEvent.click(screen.getByTestId('add-auto'))
    expect(changeConnectionType).toBeCalled()
  })
})

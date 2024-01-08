import React from 'react'
import { mock } from 'ts-mockito'
import { screen, render } from 'testSrc/helpers'
import { Cli, Props } from './Cli'

const mockedProps = mock<Props>()

describe('CLI', () => {
  it('should render', () => {
    expect(render(<Cli {...mockedProps} />)).toBeTruthy()
  })

  it('history should render properly', () => {
    const cliHistotyUnit = {
      id: 'qwe-rty',
      host: 'reddiscorp.com',
      port: 12687,
      cliHistory: ['some', 'cli', 'history'],
    }

    render(
      <Cli {...mockedProps} cliConnectionsHistory={[cliHistotyUnit, cliHistotyUnit]} />,
    )
    expect(screen.getByTestId('history-panel-view')).toBeInTheDocument()
  })
})

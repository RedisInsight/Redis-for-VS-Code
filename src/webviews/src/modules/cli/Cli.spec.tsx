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
    const cliHistoty = [{
      id: '1',
      host: 'reddiscorp.com',
      port: 12687,
      cliHistory: ['some', 'cli', 'history'],
    }, {
      id: '2',
      host: 'reddiscorp.com',
      port: 12687,
      cliHistory: ['some', 'cli', 'history'],
    }]

    render(
      <Cli {...mockedProps} cliConnectionsHistory={cliHistoty} />,
    )
    expect(screen.getByTestId('history-panel-view')).toBeInTheDocument()
  })
})

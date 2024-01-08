import React from 'react'
import { mock } from 'ts-mockito'

import { screen, fireEvent, render } from 'testSrc/helpers'
import { CliHistory, Props } from './CliHistory'

const mockedProps = mock<Props>()

const cliHistotyUnit = {
  id: 'qwe-rty',
  host: 'reddiscorp.com',
  port: 12687,
  cliHistory: ['some', 'cli', 'history'],
}

describe('CliHistory', () => {
  it('should render', () => {
    expect(render(<CliHistory {...mockedProps} />)).toBeTruthy()
  })

  it('should call cliClickHandle on select', async () => {
    const cliClickHandle = vi.fn()
    render(
      <CliHistory {...mockedProps} cliClickHandle={cliClickHandle} cliConnectionsHistory={[cliHistotyUnit]} />,
    )
    const selectCliRow = screen.getByTestId(/cli-select-row-/i)
    fireEvent.click(selectCliRow)
    expect(cliClickHandle).toBeCalledTimes(1)
  })

  it('should call cliDeleteHandle on delete', async () => {
    const cliDeleteHandle = vi.fn()
    render(
      <CliHistory {...mockedProps} cliDeleteHandle={cliDeleteHandle} cliConnectionsHistory={[cliHistotyUnit]} />,
    )
    const selectCliRow = screen.getByTestId(/cli-delete-button-/i)
    fireEvent.click(selectCliRow)
    expect(cliDeleteHandle).toBeCalledTimes(1)
  })
})

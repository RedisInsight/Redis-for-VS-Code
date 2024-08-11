import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Mock } from 'vitest'
import * as utils from 'uiSrc/utils'
import * as useDatabases from 'uiSrc/store/hooks/use-databases-store/useDatabasesStore'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { Props, HashDetails } from './HashDetails'

const mockedProps = mock<Props>()

const SHOW_TTL_COLUMN_CHECKBOX_ID = 'show-ttl-column-checkbox'

describe('HashDetails', () => {
  it('should render', () => {
    expect(render(<HashDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render add fields btn', () => {
    const { queryByTestId } = render(<HashDetails {...instance(mockedProps)} />)

    expect(queryByTestId('add-key-value-items-btn')).toBeInTheDocument()
    expect(queryByTestId(SHOW_TTL_COLUMN_CHECKBOX_ID)).not.toBeInTheDocument()
  })

  it('should render show ttl column checkbox', async () => {
    vi.spyOn(utils, 'sendEventTelemetry');

    (vi.spyOn(useDatabases, 'useDatabasesStore') as Mock).mockImplementation(() => ({
      databaseVersion: '7.3',
    }))

    render(<HashDetails {...instance(mockedProps)} />)

    fireEvent.click(screen.queryByTestId(SHOW_TTL_COLUMN_CHECKBOX_ID)!)

    expect(screen.queryByTestId(SHOW_TTL_COLUMN_CHECKBOX_ID)).toBeInTheDocument()
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: utils.TelemetryEvent.SHOW_HASH_TTL_CLICKED,
      eventData: {
        databaseId: undefined,
        action: 'hide',
      },
    })
  })
})

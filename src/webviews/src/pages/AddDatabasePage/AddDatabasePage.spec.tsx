import React from 'react'

import * as utils from 'uiSrc/utils'
import * as useCertificates from 'uiSrc/store/hooks/use-certificates-store/useCertificatesStore'
import { TelemetryEvent } from 'uiSrc/utils'
import { render } from 'testSrc/helpers'

import { AddDatabasePage } from './AddDatabasePage'

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(useCertificates, 'fetchCerts')

describe('AddDatabasePage', () => {
  it('should render', () => {
    expect(render(<AddDatabasePage />)).toBeTruthy()
  })
  it('should call actions', async () => {
    render(<AddDatabasePage />)

    expect(useCertificates.fetchCerts).toBeCalled()
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
    })
  })
})

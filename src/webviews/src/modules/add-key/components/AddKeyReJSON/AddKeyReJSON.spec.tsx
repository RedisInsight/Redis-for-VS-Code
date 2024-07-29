import React from 'react'
import { instance, mock } from 'ts-mockito'

import * as utils from 'uiSrc/utils'
import { render } from 'testSrc/helpers'

import { AddKeyReJSON, Props } from './AddKeyReJSON'

const mockedProps = mock<Props>()

vi.spyOn(utils, 'sendEventTelemetry')

describe('AddKeyReJSON', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render', () => {
    expect(render(<AddKeyReJSON {...instance(mockedProps)} />, { withRouter: true })).toBeTruthy()
  })
})

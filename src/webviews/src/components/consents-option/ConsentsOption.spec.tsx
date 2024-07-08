import React from 'react'
import { instance, mock } from 'ts-mockito'
import { constants, render } from 'testSrc/helpers'
import { ConsentsOption, Props } from './ConsentsOption'

const mockedProps = mock<Props>()

describe('ConsentsOption', () => {
  it('should render', () => {
    expect(render(<ConsentsOption
      {...instance(mockedProps)}
      consent={{ ...constants.COMMON_CONSENT_CONTENT, agreementName: 'name' }}
    />)).toBeTruthy()
  })
})

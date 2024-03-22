import React from 'react'
import { instance, mock } from 'ts-mockito'
import { constants, render } from 'testSrc/helpers'
import { ConsentOption, Props } from './ConsentOption'

const mockedProps = mock<Props>()

describe('ConsentOption', () => {
  it('should render', () => {
    expect(render(<ConsentOption
      {...instance(mockedProps)}
      consent={{ ...constants.COMMON_CONSENT_CONTENT, agreementName: 'name' }}
    />)).toBeTruthy()
  })
})

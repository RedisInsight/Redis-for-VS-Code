import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, HashDetails } from './HashDetails'

const mockedProps = mock<Props>()

describe('HashDetails', () => {
  it('should render', () => {
    expect(render(<HashDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})

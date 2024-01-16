import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, SetDetails } from './SetDetails'

const mockedProps = mock<Props>()

describe('SetDetails', () => {
  it('should render', () => {
    expect(render(<SetDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})

import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, ZSetDetails } from './ZSetDetails'

const mockedProps = mock<Props>()

describe('ZSetDetails', () => {
  it('should render', () => {
    expect(render(<ZSetDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})

import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, KeyDetailsHeaderTTL } from './KeyDetailsHeaderTTL'

const mockedProps = mock<Props>()

describe('KeyDetailsHeaderTTL', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderTTL {...instance(mockedProps)} />)).toBeTruthy()
  })
})

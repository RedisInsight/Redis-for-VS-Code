import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, KeyDetailsHeaderName } from './KeyDetailsHeaderName'

const mockedProps = mock<Props>()

describe('KeyDetailsHeaderName', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderName {...instance(mockedProps)} />)).toBeTruthy()
  })
})

import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, KeyDetailsHeaderSizeLength } from './KeyDetailsHeaderSizeLength'

const mockedProps = mock<Props>()

describe('KeyDetailsHeaderSizeLength', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderSizeLength {...instance(mockedProps)} />)).toBeTruthy()
  })
})

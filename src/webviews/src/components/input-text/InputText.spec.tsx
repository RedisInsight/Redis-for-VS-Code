import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { InputText, Props } from './InputText'

const mockedProps = mock<Props>()

describe('InputText', () => {
  it('should render', () => {
    expect(render(<InputText {...instance(mockedProps)} />)).toBeTruthy()
  })
})

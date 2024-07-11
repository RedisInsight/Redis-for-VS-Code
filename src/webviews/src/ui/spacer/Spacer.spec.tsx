import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { Spacer, Props } from './Spacer'

const mockedProps = mock<Props>()

describe('Spacer', () => {
  it('should render', async () => {
    expect(render(<Spacer {...instance(mockedProps)} />)).toBeTruthy()
  })
})

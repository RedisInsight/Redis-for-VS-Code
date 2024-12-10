import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { Chevron, Props } from './Chevron'

const mockedProps = mock<Props>()

describe('Chevron', () => {
  it('should render', async () => {
    expect(render(<Chevron {...instance(mockedProps)} />)).toBeTruthy()
  })
})

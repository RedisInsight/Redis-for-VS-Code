import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { Props, InlineEditor } from './InlineEditor'

const mockedProps = mock<Props>()

describe('InlineEditor', () => {
  it('should render', () => {
    expect(render(<InlineEditor {...instance(mockedProps)} />)).toBeTruthy()
  })
})

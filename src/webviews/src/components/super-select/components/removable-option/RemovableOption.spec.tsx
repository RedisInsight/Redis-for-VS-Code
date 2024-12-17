import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render, constants } from 'testSrc/helpers'
import { SuperSelectRemovableOption, Props } from './RemovableOption'

const mockedProps = mock<Props>()

describe('SuperSelectRemovableOption', () => {
  it('should render', async () => {
    expect(render(<SuperSelectRemovableOption {...instance(mockedProps)} options={constants.SUPER_SELECT_OPTIONS} />)).toBeTruthy()
  })
})

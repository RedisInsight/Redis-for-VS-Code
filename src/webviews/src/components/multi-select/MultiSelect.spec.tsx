import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render, constants } from 'testSrc/helpers'
import { MultiSelect, Props } from './MultiSelect'

const mockedProps = mock<Props>()

describe('MultiSelect', () => {
  it('should render', async () => {
    expect(render(
      <MultiSelect {...instance(mockedProps)} options={constants.SUPER_SELECT_OPTIONS} />),
    ).toBeTruthy()
  })
})

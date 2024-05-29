import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'testSrc/helpers'
import { RejsonDynamicTypes } from './RejsonDynamicTypes'
import { DynamicTypesProps } from '../interfaces'

const mockedProps = mock<DynamicTypesProps>()

const mockedDownloadedSimpleArray = [1, 2, 3]

describe('RejsonDynamicTypes Component', () => {
  it('renders correctly simple downloaded JSON', () => {
    render(<RejsonDynamicTypes
      {...instance(mockedProps)}
      data={mockedDownloadedSimpleArray}
      isDownloaded
    />)

    expect(screen.queryAllByTestId('json-scalar-value')).toHaveLength(3)
  })
})

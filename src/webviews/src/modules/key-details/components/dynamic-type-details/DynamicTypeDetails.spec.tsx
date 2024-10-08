import React from 'react'
import { instance, mock } from 'ts-mockito'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { render } from 'testSrc/helpers'
import { Props, DynamicTypeDetails } from './DynamicTypeDetails'

const mockedProps = mock<Props>()

const DynamicTypeDetailsTypeTests: any[] = [
  [KeyTypes.String, 'string-details'],
  [KeyTypes.Hash, 'hash-details'],
  [KeyTypes.ZSet, 'zset-details'],
  [KeyTypes.List, 'list-details'],
  [KeyTypes.Set, 'set-details'],
  [KeyTypes.ReJSON, 'json-details'],
  [KeyTypes.Stream, 'unsupported-type-details'],
  // [KeyTypes.Stream, 'stream-details'],
  // [ModulesKeyTypes.Graph, 'modules-type-details'],
  // [ModulesKeyTypes.TimeSeries, 'modules-type-details'],
  ['123', 'unsupported-type-details'],
]

describe('DynamicTypeDetails', () => {
  it('should render', () => {
    expect(render(<DynamicTypeDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it.each(DynamicTypeDetailsTypeTests)('for key type: %s (reply), data-subj should exists: %s',
    (type: KeyTypes, testId: string) => {
      const { queryByTestId } = render(<DynamicTypeDetails
        {...instance(mockedProps)}
        keyType={type}
      />, { withRouter: true })

      expect(queryByTestId(testId)).toBeInTheDocument()
    })
})

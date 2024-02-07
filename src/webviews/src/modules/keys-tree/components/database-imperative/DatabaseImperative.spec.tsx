import React, { PropsWithChildren } from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'

import { SortOrder } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import { resetKeysTree, setKeysTreeSort } from 'uiSrc/slices/app/context/context.slice'
import { cleanup, fireEvent, mockedStore, render, waitForStack } from 'testSrc/helpers'
import { DatabaseImperative } from './DatabaseImperative'
import * as useKeys from '../../hooks/useKeys'

const mockedProps = mock<PropsWithChildren>(<div />)
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

vi.spyOn(utils, 'sendEventTelemetry')

describe('DatabaseImperative', () => {
  it('should render', () => {
    expect(render(<DatabaseImperative {...instance(mockedProps)} />)).toBeTruthy()
  })
})

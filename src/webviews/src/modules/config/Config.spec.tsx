import React from 'react'
import { Mock, vi } from 'vitest'

import * as useDatabases from 'uiSrc/store/hooks/use-databases-store/useDatabasesStore'
import * as useAppInfo from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { render } from 'testSrc/helpers'
import { Config } from './Config'

vi.spyOn(useDatabases, 'fetchDatabases')
vi.spyOn(useAppInfo, 'fetchAppInfo')

describe('Config', () => {
  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })
  it('should render', () => {
    render(<Config />)
    expect(useDatabases.fetchDatabases).toBeCalled()
    expect(useAppInfo.fetchAppInfo).toBeCalled()
  })

  it('should not call fetchAppInfo if window.appInfo is object ', () => {
    vi.stubGlobal('appInfo', { server: {} })
    render(<Config />)
    expect(useDatabases.fetchDatabases).toBeCalled()
    expect(useAppInfo.fetchAppInfo).not.toBeCalled()
  })

  it('should call "setIsShowConceptsPopup" with true', () => {
    const mockSetIsShowConceptsPopup = vi.fn()
    const mockSetInitialStateAppInfo = vi.fn();

    (vi.spyOn(useAppInfo, 'useAppInfoStore') as Mock).mockImplementation(() => ({
      setInitialStateAppInfo: mockSetInitialStateAppInfo,
      setIsShowConceptsPopup: mockSetIsShowConceptsPopup,
      config: {
        agreements: {},
      },
      spec: {
        version: '1.0.0',
        agreements: {
          eula: {
            defaultValue: false,
            required: true,
            editable: false,
            since: '1.0.0',
            title: 'EULA: RedisInsight License Terms',
            label: 'Label',
          },
        },
      },
    }))

    render(<Config />)

    expect(mockSetInitialStateAppInfo).toBeCalled()
    expect(mockSetIsShowConceptsPopup).toBeCalledWith(true)
  })
})

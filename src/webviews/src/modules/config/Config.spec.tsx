import React from 'react'
import { Mock, vi } from 'vitest'

import * as useDatabases from 'uiSrc/store/hooks/use-databases-store/useDatabasesStore'
import * as useAppInfo from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import * as useRedisCommands from 'uiSrc/store/hooks/use-redis-commands-store/useRedisCommandsStore'
import { render } from 'testSrc/helpers'
import { Config } from './Config'

vi.spyOn(useDatabases, 'fetchDatabases')
vi.spyOn(useAppInfo, 'fetchAppInfo')
vi.spyOn(useRedisCommands, 'fetchRedisCommands')

describe('Config', () => {
  it('should render', () => {
    render(<Config />)
    expect(useDatabases.fetchDatabases).toBeCalled()
    expect(useAppInfo.fetchAppInfo).toBeCalled()
    expect(useRedisCommands.fetchRedisCommands).toBeCalled()
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

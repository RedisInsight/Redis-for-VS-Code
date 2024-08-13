import React from 'react'
import { Mock, vi } from 'vitest'

import * as useDatabases from 'uiSrc/store/hooks/use-databases-store/useDatabasesStore'
import * as useAppInfo from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import * as utils from 'uiSrc/utils'
import { vscodeApi } from 'uiSrc/services'
import { VscodeMessageAction } from 'uiSrc/constants'
import { render } from 'testSrc/helpers'
import { Config } from './Config'

vi.spyOn(vscodeApi, 'postMessage')
vi.spyOn(useDatabases, 'fetchDatabases')
vi.spyOn(useAppInfo, 'fetchAppInfo')

const mockedUseNavigate = vi.fn()
const mockUseLocation = vi.fn()

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom')
  return {
    ...mod,
    useLocation: mockUseLocation,
    useNavigate: () => mockedUseNavigate,
  }
})

describe('Config', () => {
  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })
  it('should render', () => {
    render(<Config />, { withRouter: true })
    expect(useDatabases.fetchDatabases).toBeCalled()
    expect(useAppInfo.fetchAppInfo).toBeCalled()
  })

  it('should not call fetchAppInfo if window.appInfo is object ', () => {
    vi.stubGlobal('appInfo', { server: {} })
    render(<Config />, { withRouter: true })
    expect(useDatabases.fetchDatabases).toBeCalled()
    expect(useAppInfo.fetchAppInfo).not.toBeCalled()
  })

  describe('show Eula', () => {
    const mockSetInitialStateAppInfo = vi.fn()
    const mockSetIsShowConcepts = vi.fn()
    beforeEach(() => {
      (vi.spyOn(useAppInfo, 'useAppInfoStore') as Mock).mockImplementation(() => ({
        setInitialStateAppInfo: mockSetInitialStateAppInfo,
        setIsShowConcepts: mockSetIsShowConcepts,
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
              title: 'EULA: RRedis for VSCode License Terms',
              label: 'Label',
            },
          },
        },
      }))
    })

    afterEach(() => {
      vi.resetAllMocks()
      vi.unstubAllGlobals()
    })

    it('should call "isDifferentConsentsExists" with true', () => {
      vi.spyOn(utils, 'isDifferentConsentsExists')

      render(<Config />, { withRouter: true })

      expect(mockSetIsShowConcepts).toBeCalled()
      expect(mockSetInitialStateAppInfo).toBeCalled()
      expect(utils.isDifferentConsentsExists).toBeCalled()
      expect(vscodeApi.postMessage).toBeCalledWith({ action: VscodeMessageAction.ShowEula })
    })
  })
})

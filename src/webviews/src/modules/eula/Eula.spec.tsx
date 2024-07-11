import React from 'react'
import * as useAppInfo from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  constants,
} from 'testSrc/helpers'
import { Eula } from './Eula'

vi.spyOn(useAppInfo, 'updateUserConfigSettingsAction')

describe('Eula', () => {
  beforeEach(() => {
    useAppInfo.useAppInfoStore.setState((state) => ({
      ...state,
      config: {
        agreements: {
          eula: true,
          version: '1.0.1',
        },
      },
      spec: {
        version: '1.0.0',
        agreements: {
          eula: {
            ...constants.COMMON_CONSENT_CONTENT,
            editable: false,
            displayInSetting: false,
            required: true,
          },
          eulaNew: {
            ...constants.COMMON_CONSENT_CONTENT,
            editable: false,
            displayInSetting: false,
            required: true,
          },
          analytics: {
            ...constants.COMMON_CONSENT_CONTENT,
            category: 'privacy',
          },
          notifications: {
            ...constants.COMMON_CONSENT_CONTENT,
            category: 'notifications',
          },
          disabledConsent: {
            ...constants.COMMON_CONSENT_CONTENT,
            disabled: true,
          },
        },
      },
    }))
  })

  it('should render', () => {
    expect(render(<Eula />)).toBeTruthy()
  })

  it('should render proper elements', () => {
    render(<Eula />)
    expect(screen.getAllByTestId(/check-option/)).toHaveLength(2)
  })

  describe('update settings', () => {
    it('option change should call "Action"', async () => {
      render(<Eula />)

      await waitFor(() => {
        screen.getAllByTestId(/check-option/).forEach(async (el) => {
          fireEvent.click(el)
        })
        fireEvent.click(screen.getByTestId('btn-submit'))
      })

      expect(useAppInfo.updateUserConfigSettingsAction).toBeCalled()
    })
  })
})

import React from 'react'
import * as useAppInfo from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  constants,
} from 'testSrc/helpers'
import { ConsentsPrivacy } from './ConsentsPrivacy'

vi.spyOn(useAppInfo, 'updateUserConfigSettingsAction')

describe('ConsentsPrivacy', () => {
  beforeEach(() => {
    useAppInfo.useAppInfoStore.setState((state) => ({
      ...state,
      isShowConceptsPopup: true,
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
    expect(render(<ConsentsPrivacy />)).toBeTruthy()
  })

  it('should render proper elements', () => {
    render(<ConsentsPrivacy />)
    expect(screen.getAllByTestId(/check-option/)).toHaveLength(1)
  })

  describe('update settings', () => {
    it('option change should call "Action"', async () => {
      render(<ConsentsPrivacy />)

      await waitFor(() => {
        screen.getAllByTestId(/check-option/).forEach(async (el) => {
          fireEvent.click(el)
        })
      })

      expect(useAppInfo.updateUserConfigSettingsAction).toBeCalled()
    })
  })
})

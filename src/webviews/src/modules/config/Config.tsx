import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  userSettingsSelector,
  setSettingsPopupState,
} from 'uiSrc/slices/user/user-settings.slice'
import {
  fetchServerInfo,
} from 'uiSrc/slices/app/info/info.slice'
import { isDifferentConsentsExists } from 'uiSrc/utils'
import { AppDispatch } from 'uiSrc/store'

export const Config = () => {
  const { config, spec } = useSelector(userSettingsSelector)

  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch(fetchServerInfo())

    // TODO: remove after BE will be implemented
    // dispatch(fetchInstancesAction())

    // fetch config settings, after that take spec
    dispatch(fetchUserConfigSettings(() => dispatch(fetchUserSettingsSpec())))
  }, [])

  useEffect(() => {
    if (config && spec) {
      checkSettingsToShowPopup()
    }
  }, [spec])

  const checkSettingsToShowPopup = () => {
    const specConsents = spec?.agreements
    const appliedConsents = config?.agreements

    dispatch(setSettingsPopupState(isDifferentConsentsExists(specConsents, appliedConsents)))
  }

  return null
}

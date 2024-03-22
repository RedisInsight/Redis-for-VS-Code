import { useEffect } from 'react'

import { useShallow } from 'zustand/react/shallow'
import { isDifferentConsentsExists } from 'uiSrc/utils'
import { fetchDatabases } from 'uiSrc/store'
import { fetchAppInfo, useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { fetchRedisCommands } from 'uiSrc/store/hooks/use-redis-commands-store/useRedisCommandsStore'

export const Config = () => {
  const appInfo = useAppInfoStore(useShallow((state) => ({
    config: state.config,
    spec: state.spec,
    setIsShowConceptsPopup: state.setIsShowConceptsPopup,
    setInitialStateAppInfo: state.setInitialState,
  })))

  useEffect(() => {
    appInfo.setInitialStateAppInfo()

    fetchAppInfo()
    fetchDatabases()
    fetchRedisCommands()
  }, [])

  useEffect(() => {
    const { config, spec } = appInfo
    if (config && spec) {
      checkSettingsToShowPopup()
    }
  }, [appInfo])

  const checkSettingsToShowPopup = () => {
    const specConsents = appInfo.spec?.agreements
    const appliedConsents = appInfo.config?.agreements

    appInfo.setIsShowConceptsPopup(isDifferentConsentsExists(specConsents, appliedConsents))
  }

  return null
}

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { isDifferentConsentsExists } from 'uiSrc/utils'
import { fetchDatabases } from 'uiSrc/store'
import { fetchAppInfo, useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { vscodeApi } from 'uiSrc/services'
import { VscodeMessageAction } from 'uiSrc/constants'

export const Config = () => {
  const appInfo = useAppInfoStore(useShallow((state) => ({
    config: state.config,
    spec: state.spec,
    setIsShowConceptsPopup: state.setIsShowConceptsPopup,
    setInitialStateAppInfo: state.setInitialState,
    setAppInfo: state.processAppInfoSuccess,
  })))

  useEffect(() => {
    appInfo.setInitialStateAppInfo()
    fetchDatabases()

    if (window.appInfo) {
      appInfo.setAppInfo(window.appInfo)
      return
    }

    fetchAppInfo((appInfo) => {
      vscodeApi.postMessage({ action: VscodeMessageAction.SaveAppInfo, data: appInfo })
    })
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

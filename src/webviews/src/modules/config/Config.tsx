import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useLocation } from 'react-router-dom'
import { isDifferentConsentsExists } from 'uiSrc/utils'
import { fetchDatabases } from 'uiSrc/store'
import { fetchAppInfo, useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { vscodeApi } from 'uiSrc/services'
import { VscodeMessageAction } from 'uiSrc/constants'

export const Config = () => {
  const { pathname } = useLocation()

  const appInfo = useAppInfoStore(useShallow((state) => ({
    config: state.config,
    spec: state.spec,
    setIsShowConcepts: state.setIsShowConcepts,
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
      checkSettingsToShowEula()
    }
  }, [appInfo])

  const checkSettingsToShowEula = () => {
    const specConsents = appInfo.spec?.agreements
    const appliedConsents = appInfo.config?.agreements

    const isShowConcepts = isDifferentConsentsExists(specConsents, appliedConsents)

    if (!isShowConcepts) {
      appInfo.setIsShowConcepts(false)
      return
    }

    appInfo.setIsShowConcepts(true)

    const isEulaPage = pathname.endsWith('main/eula')
    if (isEulaPage) {
      return
    }

    vscodeApi.postMessage({ action: VscodeMessageAction.ShowEula })
  }

  return null
}

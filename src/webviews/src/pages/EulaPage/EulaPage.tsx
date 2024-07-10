import React, { FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { VscodeMessageAction } from 'uiSrc/constants'
import { Eula } from 'uiSrc/modules'
import { vscodeApi } from 'uiSrc/services'
import { fetchAppInfo, useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'

export const EulaPage: FC<any> = () => {
  const setIsShowConcepts = useAppInfoStore(useShallow((state) => state.setIsShowConcepts))

  const onSubmitted = () => {
    fetchAppInfo((appInfo) => {
      vscodeApi.postMessage({ action: VscodeMessageAction.SaveAppInfo, data: appInfo })
      vscodeApi.postMessage({ action: VscodeMessageAction.CloseEula })
      setIsShowConcepts(false)
    })
  }

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto" data-testid="eula-page">
      <Eula onSubmitted={onSubmitted} />
    </div>
  )
}

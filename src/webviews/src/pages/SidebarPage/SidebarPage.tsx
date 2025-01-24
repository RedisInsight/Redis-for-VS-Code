import React, { FC } from 'react'
import { isNull } from 'lodash'
import { NoDatabases } from 'uiSrc/components'
import { DatabaseWrapper } from 'uiSrc/modules'
import { useDatabasesStore } from 'uiSrc/store'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { OAuthCreateFreeDb } from 'uiSrc/modules/oauth'
import { OAuthSocialSource } from 'uiSrc/constants'

export const SidebarPage: FC<any> = () => {
  const databases = useDatabasesStore((state) => state.data)
  const { isShowConcepts, config } = useAppInfoStore((state) => ({
    isShowConcepts: state.isShowConcepts,
    config: state.config,
  }))

  if (isShowConcepts || isNull(config)) {
    return null
  }

  return (
    <div className="flex w-full flex-wrap flex-col min-h-full text-vscode-icon-foreground" data-testid="tree-view-page">
      <OAuthCreateFreeDb compressed source={OAuthSocialSource.DatabasesList} />
      {databases.map((database) => (
        <DatabaseWrapper database={database} key={database.id} />
      ))}
      {!databases.length && <NoDatabases />}
    </div>
  )
}

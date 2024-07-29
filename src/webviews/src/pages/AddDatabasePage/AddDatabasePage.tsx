import React, { FC, useEffect } from 'react'
import { DatabasePanel } from 'uiSrc/modules'
import { fetchCerts } from 'uiSrc/store'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'

export const AddDatabasePage: FC<any> = () => {
  useEffect(() => {
    fetchCerts()
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
    })
  }, [])

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto flex-col" data-testid="panel-view-page">
      <DatabasePanel />
    </div>
  )
}

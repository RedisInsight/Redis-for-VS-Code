import React from 'react'
import { fireEvent } from '@testing-library/react'
import { describe, it, Mock, vi } from 'vitest'
import * as utils from 'uiSrc/utils'
import * as useAppInfo from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { OAuthSocialSource } from 'uiSrc/constants'
import { constants, render, waitForStack } from 'testSrc/helpers'

import { NoDatabases } from './NoDatabases'

vi.spyOn(utils, 'sendEventTelemetry')

describe('NoDatabases', () => {
  it('should render', () => {
    expect(render(<NoDatabases />)).toBeTruthy()
  })
  it('should send telemetry events', async () => {
    (vi.spyOn(useAppInfo, 'useAppInfoStore') as Mock).mockImplementation(() => ({
      contentCloud: constants.CONTENT_CREATE_DATABASE.cloud,
      contentDocker: constants.CONTENT_CREATE_DATABASE.docker,

    }))
    const { queryByTestId } = render(<NoDatabases />)

    fireEvent.click(queryByTestId('cloud-test-id')!)
    await waitForStack()

    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: utils.TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: {
        source: OAuthSocialSource.DatabasesList,
      },
    })

    fireEvent.click(queryByTestId('docker-test-id')!)
    await waitForStack()

    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: utils.TelemetryEvent.BUILD_USING_DOCKER_CLICKED,
    })
  })
})

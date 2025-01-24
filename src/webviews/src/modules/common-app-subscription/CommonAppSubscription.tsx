import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useShallow } from 'zustand/react/shallow'

import { useOAuthStore } from 'uiSrc/store'
import { BASE_RESOURCES_URL, CloudJobEvents, CloudJobName } from 'uiSrc/constants'
import { CloudJobInfo } from 'uiSrc/modules/oauth/interfaces'
import { Nullable } from 'uiSrc/interfaces'

export const CommonAppSubscription = () => {
  const {
    jobId,
    setJob,
  } = useOAuthStore(useShallow((state) => ({
    jobId: state.job?.id || '',
    setJob: state.setJob,
  })))
  const socketRef = useRef<Nullable<Socket>>(null)

  useEffect(() => {
    if (socketRef.current?.connected) {
      return
    }

    socketRef.current = io(`${BASE_RESOURCES_URL}`, {
      path: '/socket.io',
      forceNew: false,
      rejectUnauthorized: false,
      reconnection: true,
    })

    socketRef.current.on(CloudJobEvents.Monitor, (data: CloudJobInfo) => {
      const jobName = data.name as unknown

      if (
        jobName === CloudJobName.CreateFreeDatabase
        || jobName === CloudJobName.CreateFreeSubscriptionAndDatabase
        || jobName === CloudJobName.ImportFreeDatabase) {
        setJob(data)
      }
    })

    // Catch disconnect
    // socketRef.current?.on(SocketEvent.Disconnect, () => {
    //   unSubscribeFromAllRecommendations()
    // })

    emitCloudJobMonitor(jobId)
  }, [])

  useEffect(() => {
    emitCloudJobMonitor(jobId)
  }, [jobId])

  const emitCloudJobMonitor = (jobId: string) => {
    if (!jobId) return

    socketRef.current?.emit(
      CloudJobEvents.Monitor,
      { jobId },
    )
  }

  return null
}

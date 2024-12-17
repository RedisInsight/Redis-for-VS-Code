import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, showErrorMessage } from 'uiSrc/utils'
import { RedisString } from 'uiSrc/interfaces'
import { Certificate, CertificatesActions, CertificatesStore } from './interface'

export const initialCertsState: CertificatesStore = {
  loading: false,
  caCerts: [],
  clientCerts: [],
}

export const useCertificatesStore = create<CertificatesStore & CertificatesActions>()(
  immer(devtools((set) => ({
    ...initialCertsState,
    // actions
    processCerts: () => set({ loading: true }),
    processCertsFinal: () => set({ loading: false }),
    processCertsSuccess: (caCerts: Certificate[], clientCerts: Certificate[]) =>
      set({ caCerts, clientCerts }),
  }))),
)

// Asynchronous thunk action
export const fetchCerts = (onSuccess?: () => void) => {
  useCertificatesStore.setState(async (state) => {
    state.processCerts()
    try {
      const { data: caCerts, status: statusCaCerts } = await apiService.get(`${ApiEndpoints.CA_CERTIFICATES}`)
      const { data: clientCerts, status: statusClientCerts } = await apiService.get(`${ApiEndpoints.CLIENT_CERTIFICATES}`)

      if (isStatusSuccessful(statusCaCerts) && isStatusSuccessful(statusClientCerts)) {
        state.processCertsSuccess(caCerts, clientCerts)
        onSuccess?.()
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    } finally {
      state.processCertsFinal()
    }
  })
}

// Asynchronous thunk action
export const removeCertAction = (id: RedisString, endpoint: ApiEndpoints, onSuccess?: () => void) => {
  useCertificatesStore.setState(async (state) => {
    state.processCerts()
    try {
      const { status } = await apiService.delete(`${endpoint}/${id}`)

      if (isStatusSuccessful(status)) {
        onSuccess?.()
        fetchCerts()
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    } finally {
      state.processCertsFinal()
    }
  })
}

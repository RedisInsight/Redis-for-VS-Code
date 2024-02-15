import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { isStatusSuccessful } from 'uiSrc/utils'
import { Certificate, CertificatesActions, CertificatesStore } from './interface'

export const initialCertsState: CertificatesStore = {
  loading: false,
  caCerts: [],
  clientCerts: [],
}

export const useCertificatesStore = create<CertificatesStore & CertificatesActions>()(
  immer(devtools(persist((set) => ({
    ...initialCertsState,
    // actions
    processCerts: () => set({ loading: true }),
    processCertsFinal: () => set({ loading: false }),
    processCertsSuccess: (caCerts: Certificate[], clientCerts: Certificate[]) =>
      set({ caCerts, clientCerts }),

  }),
  { name: 'certificates' }))),
)

// Asynchronous thunk action
export const fetchCerts = () => {
  useCertificatesStore.setState(async (state) => {
    state.processCerts()
    try {
      const { data: caCerts, status: statusCaCerts } = await apiService.get(`${ApiEndpoints.CA_CERTIFICATES}`)
      const { data: clientCerts, status: statusClientCerts } = await apiService.get(`${ApiEndpoints.CLIENT_CERTIFICATES}`)

      if (isStatusSuccessful(statusCaCerts) && isStatusSuccessful(statusClientCerts)) {
        state.processCertsSuccess(caCerts, clientCerts)
      }
    } catch (error) {
      console.debug({ error })
    } finally {
      state.processCertsFinal()
    }
  })
}

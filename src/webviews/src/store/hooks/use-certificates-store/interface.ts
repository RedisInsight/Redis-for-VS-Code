export interface Certificate {
  id: string
  name: string
}

export interface CertificatesStore {
  loading: boolean
  caCerts: Certificate[]
  clientCerts: Certificate[]
}

export interface CertificatesActions {
  processCerts: () => void
  processCertsFinal: () => void
  processCertsSuccess: (caCerts: Certificate[], clientCerts: Certificate[]) => void
}

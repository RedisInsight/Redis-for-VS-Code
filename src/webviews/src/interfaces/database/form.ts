import { ADD_NEW_CA_CERT, NO_CA_CERT } from 'uiSrc/constants'
import { Database } from 'uiSrc/store'

export interface DbConnectionInfo extends Database {
  id?: string
  port: string
  tlsClientAuthRequired?: boolean
  certificates?: { id: number, name: string }[]
  selectedTlsClientCertId?: string | 'ADD_NEW' | undefined
  newTlsCertPairName?: string
  newTlsClientCert?: string
  newTlsClientKey?: string
  servername?: string
  verifyServerTlsCert?: boolean
  caCertificates?: { name: string, id: string }[]
  selectedCaCertName: string | typeof ADD_NEW_CA_CERT.value | typeof NO_CA_CERT.value
  newCaCertName?: string
  newCaCert?: string
  username?: string
  compressor?: string
  password?: string | true
  timeout?: string
  showDb?: boolean
  showCompressor?: boolean
  sni?: boolean
  sentinelMasterUsername?: string
  sentinelMasterPassword?: string | true
  sentinelMasterName?: string
  ssh?: boolean
  sshPassType?: string
  sshHost?: string
  sshPort?: string
  sshUsername?: string
  sshPassword?: string | true
  sshPrivateKey?: string | true
  sshPassphrase?: string | true
}

export interface ISubmitButton {
  onClick: () => void
  text?: string
  submitIsDisabled?: boolean
}

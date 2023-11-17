import { ConnectionType } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'

export interface InitialStateDatabases {
  loading: boolean
  error: string
  data: Database[]
  connectedDatabase: Database
  freeDatabase: Nullable<Database>
}

export interface Database {
  host: string
  port: number
  nameFromProvider?: Nullable<string>
  provider?: string
  id: string
  endpoints?: Nullable<Endpoint[]>
  connectionType?: ConnectionType
  lastConnection?: Nullable<Date>
  password?: Nullable<string>
  username?: Nullable<string>
  name?: string
  db?: number
  tls?: boolean
  ssh?: boolean
  sshOptions?: {
    host: string
    port: number
    username?: string
    password?: string | true
    privateKey?: string
    passphrase?: string | true
  }
  tlsClientAuthRequired?: boolean
  verifyServerCert?: boolean
  caCert?: CaCertificate
  clientCert?: ClientCertificate
  authUsername?: Nullable<string>
  authPass?: Nullable<string>
  isDeleting?: boolean
  sentinelMaster?: SentinelMaster
  modules: AdditionalRedisModule[]
  version: Nullable<string>
  isRediStack?: boolean
  visible?: boolean
  loading?: boolean
  isFreeDb?: boolean
}

export interface AdditionalRedisModule {
  name: string
  version?: number
  semanticVersion?: string
}

interface CaCertificate {
  id?: string
  name?: string
  certificate?: string
}

interface ClientCertificate {
  id?: string
  name?: string
  key?: string
  certificate?: string
}

export interface Endpoint {
  host: string
  port: number
}

export interface SentinelMaster {
  name: string
  username?: string
  password?: string
  host?: string
  status?: SentinelMasterStatus
  numberOfSlaves?: number
  nodes?: Endpoint[]
}

export enum SentinelMasterStatus {
  Active = 'active',
  Down = 'down',
}

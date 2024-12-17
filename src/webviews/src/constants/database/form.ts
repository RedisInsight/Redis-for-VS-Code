import * as l10n from '@vscode/l10n'

export const ADD_NEW_CA_CERT_LABEL = l10n.t('Add new CA certificate')
export const NO_CA_CERT_LABEL = l10n.t('No CA Certificate')
export const ADD_NEW_LABEL = l10n.t('Add new certificate')
export const ADD_NEW_CA_CERT = { value: 'ADD_NEW_CA_CERT', label: ADD_NEW_CA_CERT_LABEL }
export const NO_CA_CERT = { value: 'NO_CA_CERT', label: NO_CA_CERT_LABEL }
export const ADD_NEW = { value: 'ADD_NEW', label: ADD_NEW_LABEL }
export const NONE = l10n.t('NONE')
export const DEFAULT_HOST = '127.0.0.1'
export const DEFAULT_PORT = '6379'
export const SECURITY_FIELD = '••••••••••••'
export const DEFAULT_ALIAS = `${DEFAULT_HOST}:${DEFAULT_PORT}`

export enum SshPassType {
  Password = 'password',
  PrivateKey = 'privateKey',
}

export const fieldDisplayNames = {
  port: l10n.t('Port'),
  host: l10n.t('Host'),
  name: l10n.t('Database alias'),
  selectedCaCertName: l10n.t('CA Certificate'),
  newCaCertName: l10n.t('CA Certificate Name'),
  newCaCert: l10n.t('CA certificate'),
  newTlsCertPairName: l10n.t('Client Certificate Name'),
  newTlsClientCert: l10n.t('Client Certificate'),
  newTlsClientKey: l10n.t('Private Key'),
  servername: l10n.t('Server Name'),
  sentinelMasterName: l10n.t('Primary Group Name'),
  sshHost: l10n.t('SSH Host'),
  sshPort: l10n.t('SSH Port'),
  sshPrivateKey: l10n.t('SSH Private Key'),
  sshUsername: l10n.t('SSH Username'),
}

const DEFAULT_TIMEOUT_ENV = process.env.CONNECTIONS_TIMEOUT_DEFAULT || '30000' // 30 sec

export const DEFAULT_TIMEOUT = parseInt(DEFAULT_TIMEOUT_ENV, 10)

export const SubmitBtnText = {
  AddDatabase: l10n.t('Add Redis Database'),
  EditDatabase: l10n.t('Apply Changes'),
  CloneDatabase: l10n.t('Clone Database'),
}

export const REDIS_URI_SCHEMES = ['redis', 'rediss']

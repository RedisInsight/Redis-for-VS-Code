import { ConnectionString } from 'connection-string'
import { isUndefined, toString } from 'lodash'
import React from 'react'
import { FormikErrors } from 'formik'
import {
  REDIS_URI_SCHEMES,
  ADD_NEW,
  ADD_NEW_CA_CERT, DEFAULT_ALIAS,
  DEFAULT_HOST, DEFAULT_PORT, DEFAULT_TIMEOUT,
  fieldDisplayNames,
  NO_CA_CERT, NONE,
  SshPassType,
} from 'uiSrc/constants'
import { DatabaseType, Nullable, DbConnectionInfo } from 'uiSrc/interfaces'

export const getTlsSettings = (values: DbConnectionInfo) => ({
  useTls: values.tls,
  servername: (values.sni && values.servername) || undefined,
  verifyServerCert: values.verifyServerTlsCert,
  caCert:
    !values.tls || values.selectedCaCertName === NO_CA_CERT
      ? undefined
      : values.selectedCaCertName === ADD_NEW_CA_CERT
        ? {
          new: {
            name: values.newCaCertName,
            certificate: values.newCaCert,
          },
        }
        : {
          name: values.selectedCaCertName,
        },
  clientAuth: values.tls && values.tlsClientAuthRequired,
  clientCert: !values.tls
    ? undefined
    : typeof values.selectedTlsClientCertId === 'string'
    && values.tlsClientAuthRequired
    && values.selectedTlsClientCertId !== ADD_NEW
      ? { id: values.selectedTlsClientCertId }
      : values.selectedTlsClientCertId === ADD_NEW && values.tlsClientAuthRequired
        ? {
          new: {
            name: values.newTlsCertPairName,
            certificate: values.newTlsClientCert,
            key: values.newTlsClientKey,
          },
        }
        : undefined,
})

export const applyTlSDatabase = (database: any, tlsSettings: any) => {
  const { useTls, verifyServerCert, servername, caCert, clientAuth, clientCert } = tlsSettings
  if (!useTls) return

  database.tls = useTls
  database.tlsServername = servername
  database.verifyServerCert = !!verifyServerCert

  if (!isUndefined(caCert?.new)) {
    database.caCert = {
      name: caCert?.new.name,
      certificate: caCert?.new.certificate,
    }
  }

  if (!isUndefined(caCert?.name)) {
    database.caCert = { id: caCert?.name }
  }

  if (clientAuth) {
    if (!isUndefined(clientCert.new)) {
      database.clientCert = {
        name: clientCert.new.name,
        certificate: clientCert.new.certificate,
        key: clientCert.new.key,
      }
    }

    if (!isUndefined(clientCert.id)) {
      database.clientCert = { id: clientCert.id }
    }
  }
}

export const applySSHDatabase = (database: any, values: DbConnectionInfo) => {
  const {
    ssh,
    sshPassType,
    sshHost,
    sshPort,
    sshPassword,
    sshUsername,
    sshPassphrase,
    sshPrivateKey,
  } = values

  if (ssh) {
    database.ssh = true
    database.sshOptions = {
      host: sshHost,
      port: +sshPort,
      username: sshUsername,
    }

    if (sshPassType === SshPassType.Password) {
      database.sshOptions.password = sshPassword
      database.sshOptions.passphrase = null
      database.sshOptions.privateKey = null
    }

    if (sshPassType === SshPassType.PrivateKey) {
      database.sshOptions.password = null
      database.sshOptions.passphrase = sshPassphrase
      database.sshOptions.privateKey = sshPrivateKey
    }
  }
}

export const getFormErrors = (values: DbConnectionInfo) => {
  const errs: FormikErrors<DbConnectionInfo> = {}

  if (!values.host) {
    errs.host = fieldDisplayNames.host
  }
  if (!values.port) {
    errs.port = fieldDisplayNames.port
  }

  if (
    values.tls
    && values.verifyServerTlsCert
    && values.selectedCaCertName === NO_CA_CERT
  ) {
    errs.selectedCaCertName = fieldDisplayNames.selectedCaCertName
  }

  if (
    values.tls
    && values.selectedCaCertName === ADD_NEW_CA_CERT
    && values.newCaCertName === ''
  ) {
    errs.newCaCertName = fieldDisplayNames.newCaCertName
  }

  if (
    values.tls
    && values.selectedCaCertName === ADD_NEW_CA_CERT
    && values.newCaCert === ''
  ) {
    errs.newCaCert = fieldDisplayNames.newCaCert
  }

  if (
    values.tls
    && values.sni
    && values.servername === ''
  ) {
    errs.servername = fieldDisplayNames.servername
  }

  if (
    values.tls
    && values.tlsClientAuthRequired
    && values.selectedTlsClientCertId === ADD_NEW
  ) {
    if (values.newTlsCertPairName === '') {
      errs.newTlsCertPairName = fieldDisplayNames.newTlsCertPairName
    }
    if (values.newTlsClientCert === '') {
      errs.newTlsClientCert = fieldDisplayNames.newTlsClientCert
    }
    if (values.newTlsClientKey === '') {
      errs.newTlsClientKey = fieldDisplayNames.newTlsClientKey
    }
  }

  if (values.ssh) {
    if (!values.sshHost) {
      errs.sshHost = fieldDisplayNames.sshHost
    }
    if (!values.sshPort) {
      errs.sshPort = fieldDisplayNames.sshPort
    }
    if (!values.sshUsername) {
      errs.sshUsername = fieldDisplayNames.sshUsername
    }
    if (values.sshPassType === SshPassType.PrivateKey && !values.sshPrivateKey) {
      errs.sshPrivateKey = fieldDisplayNames.sshPrivateKey
    }
  }

  return errs
}

export const autoFillFormDetails = (
  content: string,
  initialValues: any,
  setInitialValues: (data: any) => void,
  instanceType: DatabaseType,
): boolean => {
  try {
    const details = new ConnectionString(content)

    /* If a protocol exists, it should be a redis protocol */
    if (details.protocol && !REDIS_URI_SCHEMES.includes(details.protocol)) return false
    /*
     * Auto fill logic:
     * 1) If the port is parsed, we are sure that the user has indeed copied a connection string.
     *    '172.18.0.2:12000'                => {host: '172,18.0.2', port: 12000}
     *    'redis-12000.cluster.local:12000' => {host: 'redis-12000.cluster.local', port: 12000}
     *    'lorem ipsum'                     => {host: undefined, port: undefined}
     * 2) If the port is `undefined` but a redis URI scheme is present as protocol, we follow
     *    the "Scheme semantics" as mentioned in the official URI schemes.
     *    i)  redis:// - https://www.iana.org/assignments/uri-schemes/prov/redis
     *    ii) rediss:// - https://www.iana.org/assignments/uri-schemes/prov/rediss
     */
    if (
      details.port !== undefined
      || REDIS_URI_SCHEMES.includes(details.protocol || '')
    ) {
      const getUpdatedInitialValues = () => {
        switch (instanceType) {
          case DatabaseType.RedisEnterpriseCluster: {
            return ({
              host: details.hostname || initialValues.host || 'localhost',
              port: `${details.port || initialValues.port || 9443}`,
              username: details.user || '',
              password: details.password || '',
            })
          }

          case DatabaseType.Sentinel: {
            return ({
              host: details.hostname || initialValues.host || 'localhost',
              port: `${details.port || initialValues.port || 9443}`,
              username: details.user || '',
              password: details.password,
              tls: details.protocol === 'rediss',
            })
          }

          case DatabaseType.Standalone: {
            return ({
              name: details.host || initialValues.name || 'localhost:6379',
              host: details.hostname || initialValues.host || 'localhost',
              port: `${details.port || initialValues.port || 9443}`,
              username: details.user || '',
              password: details.password,
              tls: details.protocol === 'rediss',
              ssh: false,
              sshPassType: SshPassType.Password,
            })
          }
          default: {
            return {}
          }
        }
      }
      setInitialValues(getFormValues(getUpdatedInitialValues()))
      /*
       * autofill was successfull so return true
       */
      return true
    }
  } catch (err) {
    /* The pasted content is not a connection URI so ignore. */
    return false
  }
  return false
}

export const getSubmitButtonContent = (errors: FormikErrors<DbConnectionInfo>, submitIsDisabled?: boolean) => {
  const maxErrorsCount = 5
  const errorsArr = Object.values(errors).map((err) => [
    err,
    <br key={err as string} />,
  ])

  if (errorsArr.length > maxErrorsCount) {
    errorsArr.splice(maxErrorsCount, errorsArr.length, ['...'])
  }

  return submitIsDisabled ? (
    <div>{errorsArr}</div>
  ) : null
}

export const getFormValues = (instance?: Nullable<Record<string, any>>) => ({
  ...instance,
  host: instance?.host ?? (instance ? '' : DEFAULT_HOST),
  port: instance?.port?.toString() ?? (instance ? '' : DEFAULT_PORT),
  timeout: instance?.timeout
    ? toString(instance?.timeout / 1_000)
    : toString(DEFAULT_TIMEOUT / 1_000),
  name: instance?.name ?? (instance ? '' : DEFAULT_ALIAS),
  username: instance?.username ?? '',
  password: instance?.password ?? '',
  tls: instance?.tls ?? false,
  db: instance?.db,
  compressor: instance?.compressor ?? NONE,
  modules: instance?.modules,
  showDb: !!instance?.db,
  showCompressor: instance && instance.compressor && instance.compressor !== NONE,
  sni: !!instance?.servername,
  servername: instance?.servername,
  newCaCert: '',
  newCaCertName: '',
  selectedCaCertName: instance?.caCert?.id ?? NO_CA_CERT,
  tlsClientAuthRequired: instance?.clientCert?.id ?? false,
  verifyServerTlsCert: instance?.verifyServerCert ?? false,
  newTlsCertPairName: '',
  selectedTlsClientCertId: instance?.clientCert?.id ?? ADD_NEW,
  newTlsClientCert: '',
  newTlsClientKey: '',
  sentinelMasterName: instance?.sentinelMaster?.name || '',
  sentinelMasterUsername: instance?.sentinelMaster?.username,
  sentinelMasterPassword: instance?.sentinelMaster?.password,
  ssh: instance?.ssh ?? false,
  sshPassType: instance?.sshOptions
    ? (instance.sshOptions.privateKey ? SshPassType.PrivateKey : SshPassType.Password)
    : SshPassType.Password,
  sshHost: instance?.sshOptions?.host ?? '',
  sshPort: instance?.sshOptions?.port ?? 22,
  sshUsername: instance?.sshOptions?.username ?? '',
  sshPassword: instance?.sshOptions?.password ?? '',
  sshPrivateKey: instance?.sshOptions?.privateKey ?? '',
  sshPassphrase: instance?.sshOptions?.passphrase ?? '',
})

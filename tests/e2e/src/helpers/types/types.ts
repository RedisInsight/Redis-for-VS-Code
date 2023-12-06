/**
 * Add new database parameters
 * @param host The hostname of the database
 * @param port The port of the database
 * @param databaseName The name of the database
 * @param databaseUsername The username of the database
 * @param databasePassword The password of the database
 */
export type AddNewDatabaseParameters = {
  host: string
  port: string
  databaseName?: string
  databaseUsername?: string
  databasePassword?: string
  caCert?: {
    name?: string
    certificate?: string
  }
  clientCert?: {
    name?: string
    certificate?: string
    key?: string
  }
}

/**
 * Sentinel database parameters
 * @param sentinelHost The host of sentinel
 * @param sentinelPort The port of sentinel
 * @param sentinelPassword The password of sentinel
 */
export type SentinelParameters = {
  sentinelHost: string
  sentinelPort: string
  masters?: {
    alias?: string
    db?: string
    name?: string
    password?: string
  }[]
  sentinelPassword?: string
  name?: string[]
}

/**
 * OSS Cluster database parameters
 * @param ossClusterHost The host of OSS Cluster
 * @param ossClusterPort The port of OSS Cluster
 * @param ossClusterDatabaseName Database name for OSS Cluster
 */

export type OSSClusterParameters = {
  ossClusterHost: string
  ossClusterPort: string
  ossClusterDatabaseName: string
}

/**
 * Already existing database parameters
 * @param id The id of the database
 * @param host The host of the database
 * @param port The port of the database
 * @param name The name of the database
 * @param connectionType The connection type of the database
 * @param lastConnection The last connection time of the database
 */
export type databaseParameters = {
  id: string
  host?: string
  port?: string
  name?: string
  connectionType?: string
  lastConnection?: string
}

/**
 * Nodes in OSS Cluster parameters
 * @param host The host of the node
 * @param port The port of the node
 */
export type ClusterNodes = {
  host: string
  port: string
}

/**
 * SSH parameters
 * @param sshHost The hostname of ssh
 * @param sshPort The port of ssh
 * @param sshUsername The username of ssh
 * @param sshPassword The password of ssh
 * @param sshPrivateKey The private key of ssh
 * @param sshPassphrase The passphrase of ssh
 */
export type SSHParameters = {
  sshHost: string
  sshPort: string
  sshUsername: string
  sshPassword?: string
  sshPrivateKey?: string
  sshPassphrase?: string
}

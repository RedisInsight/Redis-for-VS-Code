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

/**
 * Add new keys parameters
 * @param keyName The name of the key
 * @param TTL The ttl of the key
 * @param value The value of the key
 * @param members The members of the key
 * @param scores The scores of the key member
 * @param field The field of the key
 */
export type AddNewKeyParameters = {
  keyName: string
  value?: string
  TTL?: string
  members?: string
  scores?: string
  field?: string
  fields?: [
    {
      field?: string
      valuse?: string
    },
  ]
}

/**
* Hash key parameters
* @param keyName The name of the key
* @param fields The Array with fields
* @param field The field of the field
* @param value The value of the field

*/
export type HashKeyParameters = {
  keyName: string
  fields: {
    field: string
    value: string
  }[]
}

/**
 * Stream key parameters
 * @param keyName The name of the key
 * @param entries The Array with entries
 * @param id The id of entry
 * @param fields The Array with fields
 */
export type StreamKeyParameters = {
  keyName: string
  entries: {
    id: string
    fields: {
      name: string
      value: string
    }[]
  }[]
}

/**
 * Set key parameters
 * @param keyName The name of the key
 * @param members The Array with members
 */
export type SetKeyParameters = {
  keyName: string
  members: string[]
}

/**
 * Sorted Set key parameters
 * @param keyName The name of the key
 * @param members The Array with members
 * @param name The name of the member
 * @param id The id of the member
 */
export type SortedSetKeyParameters = {
  keyName: string
  members: {
    name: string
    score: number
  }[]
}

/**
 * List key parameters
 * @param keyName The name of the key
 * @param element The element in list
 */
export type ListKeyParameters = {
  keyName: string
  element: string
}

/**
 * String key parameters
 * @param keyName The name of the key
 * @param value The value in the string
 */
export type StringKeyParameters = {
  keyName: string
  value: string
}

/**
 * Json key parameters
 * @param keyName The name of the key
 * @param data The value in the json
 */
export type JsonKeyParameters = {
  keyName: string
  data: string
}

/**
 * API response result
 * @param T The type of the successful value
 * @param E The type of the error
 */
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E }

export type AddKeyArguments = {
  keysCount?: number
  fieldsCount?: number
  elementsCount?: number
  membersCount?: number
  keyName?: string
  keyNameStartWith?: string
  fieldStartWith?: string
  fieldValueStartWith?: string
  elementStartWith?: string
  memberStartWith?: string
}

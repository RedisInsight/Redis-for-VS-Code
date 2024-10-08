import * as os from 'os'
import * as fs from 'fs'
import { join as joinPath } from 'path'
import { Chance } from 'chance'
const chance = new Chance()

export class Config {
  static apiUrl = process.env.API_URL || 'http://127.0.0.1:5541/api'
  static vscodeVersion = process.env.VSCODE_VERSION || '1.87.2'
  static extensionName =
    process.env.EXTENSION_NAME || 'redis-for-vscode-extension.vsix'

  static workingDirectory =
    process.env.APP_FOLDER_ABSOLUTE_PATH ||
    joinPath(os.homedir(), process.env.RI_APP_FOLDER_NAME || '.redis-for-vscode')
  static fileDownloadPath = joinPath(os.homedir(), 'Downloads')
  static uniqueId = chance.string({ length: 10 })

  static ossStandaloneConfig = {
    host: process.env.OSS_STANDALONE_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_PORT || '8100',
    databaseName: `${
      process.env.OSS_STANDALONE_DATABASE_NAME || 'test_standalone'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD,
  }

  static ossStandaloneConfigEmpty = {
    host: process.env.OSS_STANDALONE_EMPTY_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_EMPTY_PORT || '8105',
    databaseName: `${
      process.env.OSS_STANDALONE_EMPTY_DATABASE_NAME || 'test_standalone_empty'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_EMPTY_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_EMPTY_PASSWORD,
  }

  static ossStandaloneV5Config = {
    host: process.env.OSS_STANDALONE_V5_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_V5_PORT || '8101',
    databaseName: `${
      process.env.OSS_STANDALONE_V5_DATABASE_NAME || 'test_standalone-v5'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_V5_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V5_PASSWORD,
  }

  static ossStandaloneRedisearch = {
    host:
      process.env.OSS_STANDALONE_REDISEARCH_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_REDISEARCH_PORT || '8102',
    databaseName: `${
      process.env.OSS_STANDALONE_REDISEARCH_DATABASE_NAME ||
      'test_standalone-redisearch'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_REDISEARCH_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_REDISEARCH_PASSWORD,
  }

  static ossStandaloneV7Config = {
    host: process.env.OSS_STANDALONE_V7_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_V7_PORT || '8108',
    databaseName: `${process.env.OSS_STANDALONE_V7_DATABASE_NAME || 'test_standalone-v7'}-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_V7_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V7_PASSWORD
  }

  static ossClusterConfig = {
    ossClusterHost: process.env.OSS_CLUSTER_HOST || 'localhost',
    ossClusterPort: process.env.OSS_CLUSTER_PORT || '8200',
    ossClusterDatabaseName: `${
      process.env.OSS_CLUSTER_DATABASE_NAME || 'test_cluster'
    }-${this.uniqueId}`,
  }

  static ossSentinelConfig = {
    sentinelHost: process.env.OSS_SENTINEL_HOST || 'localhost',
    sentinelPort: process.env.OSS_SENTINEL_PORT || '28100',
    sentinelPassword: process.env.OSS_SENTINEL_PASSWORD || 'password',
    masters: [
      {
        alias: `primary-group-1}-${this.uniqueId}`,
        db: '0',
        name: 'primary-group-1',
        password: 'defaultpass',
      },
      {
        alias: `primary-group-2}-${this.uniqueId}`,
        db: '0',
        name: 'primary-group-2',
        password: 'defaultpass',
      },
    ],
    name: ['primary-group-1', 'primary-group-2'],
  }

  static redisEnterpriseClusterConfig = {
    host: process.env.RE_CLUSTER_HOST || 'localhost',
    port: process.env.RE_CLUSTER_PORT || '19443',
    databaseName: process.env.RE_CLUSTER_DATABASE_NAME || 'test-re-standalone',
    databaseUsername: process.env.RE_CLUSTER_ADMIN_USER || 'demo@redislabs.com',
    databasePassword: process.env.RE_CLUSTER_ADMIN_PASSWORD || '123456',
  }

  static invalidOssStandaloneConfig = {
    host: 'oss-standalone-invalid',
    port: '1010',
    databaseName: `${
      process.env.OSS_STANDALONE_INVALID_DATABASE_NAME ||
      'test_standalone-invalid'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_INVALID_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_INVALID_PASSWORD,
  }

  static ossStandaloneBigConfig = {
    host: process.env.OSS_STANDALONE_BIG_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_BIG_PORT || '8103',
    databaseName: `${
      process.env.OSS_STANDALONE_BIG_DATABASE_NAME || 'test_standalone_big'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_BIG_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_BIG_PASSWORD,
  }

  static cloudDatabaseConfig = {
    host: process.env.E2E_CLOUD_DATABASE_HOST || '',
    port: process.env.E2E_CLOUD_DATABASE_PORT || '',
    databaseName: `${process.env.E2E_CLOUD_DATABASE_NAME || 'cloud-database'}-${
      this.uniqueId
    }`,
    databaseUsername: process.env.E2E_CLOUD_DATABASE_USERNAME,
    databasePassword: process.env.E2E_CLOUD_DATABASE_PASSWORD,
    accessKey: process.env.E2E_CLOUD_API_ACCESS_KEY || '',
    secretKey: process.env.E2E_CLOUD_API_SECRET_KEY || '',
  }

  static ossStandaloneNoPermissionsConfig = {
    host: process.env.OSS_STANDALONE_NOPERM_HOST || 'oss-standalone',
    port: process.env.OSS_STANDALONE_NOPERM_PORT || '6379',
    databaseName: `${
      process.env.OSS_STANDALONE_NOPERM_DATABASE_NAME ||
      'oss-standalone-no-permissions'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_NOPERM_USERNAME || 'noperm',
    databasePassword: process.env.OSS_STANDALONE_NOPERM_PASSWORD,
  }

  static ossStandaloneForSSHConfig = {
    host: process.env.OSS_STANDALONE_SSH_HOST || '172.33.100.111',
    port: process.env.OSS_STANDALONE_SSH_PORT || '6379',
    databaseName: `${
      process.env.OSS_STANDALONE_SSH_DATABASE_NAME || 'oss-standalone-for-ssh'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_SSH_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_SSH_PASSWORD,
  }

  static ossStandaloneTlsConfig = {
    host: process.env.OSS_STANDALONE_TLS_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_TLS_PORT || '8104',
    databaseName: `${process.env.OSS_STANDALONE_TLS_DATABASE_NAME || 'test_standalone_tls'}-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_TLS_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_TLS_PASSWORD,
    caCert: {
      name: `ca}-${this.uniqueId}`,
      certificate:
        process.env.E2E_CA_CRT ||
        fs.readFileSync(
          './src/rte/oss-standalone-tls/certs/redisCA.crt',
          'utf-8',
        ),
    },
    clientCert: {
      name: `client}-${this.uniqueId}`,
      certificate:
        process.env.E2E_CLIENT_CRT ||
        fs.readFileSync(
          './src/rte/oss-standalone-tls/certs/redis.crt',
          'utf-8',
        ),
      key:
        process.env.E2E_CLIENT_KEY ||
        fs.readFileSync(
          './src/rte/oss-standalone-tls/certs/redis.key',
          'utf-8',
        ),
    },
  }

  static ossStandaloneRedisGears = {
    host:
      process.env.OSS_STANDALONE_REDISGEARS_HOST ||
      'localhost',
    port: process.env.OSS_STANDALONE_REDISGEARS_PORT || '8106',
    databaseName: `${
      process.env.OSS_STANDALONE_REDISGEARS_DATABASE_NAME ||
      'test_standalone_redisgears'
    }-${this.uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_REDISGEARS_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_REDISGEARS_PASSWORD,
  }

  static ossClusterRedisGears = {
    ossClusterHost:
      process.env.OSS_CLUSTER_REDISGEARS_2_HOST || 'localhost',
    ossClusterPort: process.env.OSS_CLUSTER_REDISGEARS_2_PORT || '8107',
    ossClusterDatabaseName: `${
      process.env.OSS_CLUSTER_REDISGEARS_2_NAME || 'test_cluster-gears-2.0'
    }-${this.uniqueId}`,
  }
}

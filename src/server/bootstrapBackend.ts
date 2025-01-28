import * as vscode from 'vscode'
import * as getPort from 'detect-port'
import * as path from 'path'
import * as fs from 'fs'
import { setUIStorageField } from '../lib'
import { CustomLogger } from '../logger'
import { sleep } from '../utils'
import { AuthStrategy } from '../lib/auth/auth.interface'
import { createAuthStrategy } from '../lib/auth/auth.factory'
import { EXTENSION_NAME } from '../constants'

let gracefulShutdown: Function
let beApp: any
let beCloudAuthService: any

// Create auth strategy after beApp is initialized
let authStrategy: AuthStrategy

const backendPath = path.join(__dirname, '..', 'redis-backend', 'dist-minified')
process.env.RI_DEFAULTS_DIR = path.join(backendPath, 'defaults')

export async function startBackend(logger: CustomLogger): Promise<any> {
  const appPort = process.env.RI_APP_PORT

  const port = await (await getPort.default(+appPort!)).toString()
  logger.logServer(`Starting at port: ${port}`)

  await setUIStorageField('appPort', port)

  if (!fs.existsSync(backendPath)) {
    const errorMessage = 'Can\'t find api folder. Please run "yarn download:backend" command'
    vscode.window.showErrorMessage(errorMessage)
    console.debug(errorMessage)
  } else {
    const message = vscode.window.setStatusBarMessage(`Starting ${EXTENSION_NAME}...`)

    try {
      // @ts-ignore
      const server = await import('../../dist/redis-backend/dist-minified/main')
      const { gracefulShutdown: gracefulShutdownFn, app: apiApp, cloudAuthService } = await server.default(port, logger)
      gracefulShutdown = gracefulShutdownFn
      beApp = apiApp
      beCloudAuthService = cloudAuthService

      // wait BE requests to take jsons from github
      await sleep(300)

      authStrategy = createAuthStrategy()
      await authStrategy.initialize(cloudAuthService)

      logger.logServer('BE started')
    } catch (error) {
      logger.logServer(`[Error] startBackendError: ${error}`)
    } finally {
      message.dispose()
    }
  }
}

export const getBackendGracefulShutdown = () => gracefulShutdown?.()
export const getBackendApp = () => beApp
export const getBackendCloudAuthService = () => beCloudAuthService

import * as vscode from 'vscode'
import * as getPort from 'detect-port'
import * as path from 'path'
import * as fs from 'fs'
import { workspaceStateService } from '../lib'
import { CustomLogger } from '../logger'
import { sleep } from '../utils'

let gracefulShutdown: Function
let beApp: any

const backendPath = path.join(__dirname, '..', 'redis-backend/dist-minified')

export async function startBackend(logger: CustomLogger): Promise<any> {
  const appPort = process.env.RI_APP_PORT

  const port = await (await getPort.default(+appPort!)).toString()
  logger.log(`Starting at port: ${port}`)

  workspaceStateService.set('appPort', port)

  if (!fs.existsSync(backendPath)) {
    const errorMessage = 'Can\'t find api folder. Please run "yarn download:backend" command'
    vscode.window.showErrorMessage(errorMessage)
    console.debug(errorMessage)
  } else {
    const message = vscode.window.setStatusBarMessage('Starting Redis for VS Code...')

    try {
      // @ts-ignore
      const server = await import('../../dist/redis-backend/dist-minified/main')
      const { gracefulShutdown: gracefulShutdownFn, app: apiApp } = await server.default(port, logger)
      gracefulShutdown = gracefulShutdownFn
      beApp = apiApp

      // wait BE requests to take jsons from github
      await sleep(300)
      logger.log('BE started')
    } catch (error) {
      logger.log(`startBackendError: ${error}`)
    } finally {
      message.dispose()
    }
  }
}

export const getBackendGracefulShutdown = () => gracefulShutdown?.()
export const getBackendApp = () => beApp

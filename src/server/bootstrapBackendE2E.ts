import * as vscode from 'vscode'
import * as getPort from 'detect-port'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'
import { ChildProcessWithoutNullStreams } from 'child_process'
import { workspaceStateService } from '../lib'
import { CustomLogger } from '../logger'

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const devEnv = process.env.NODE_ENV === 'development'
const appUrl = process.env.RI_BASE_APP_URL
const appPort = process.env.RI_APP_PORT
const appPrefix = process.env.RI_APP_PREFIX
const appFolder = process.env.RI_APP_FOLDER
const appHost = process.env.RI_APP_HOST

const backendPath = path.join(__dirname, '..', 'redis-backend/dist-minified')
let PSinst: ChildProcessWithoutNullStreams

export async function startBackendE2E(logger: CustomLogger): Promise<any> {
  logger.log('Starting backend in E2E')
  const port = await (await getPort.default(+appPort!)).toString()
  logger.log(`Starting at port: ${port}`)

  workspaceStateService.set('appPort', port)

  return new Promise((resolve) => {
    const backendSrcPath = path.join(backendPath, 'main.js')

    if (!fs.existsSync(backendPath)) {
      const errorMessage = 'Can\'t find api folder. Please run "yarn download:backend" command'
      vscode.window.showErrorMessage(errorMessage)
      console.debug(errorMessage)
      resolve('')
    } else {
      const message = vscode.window.setStatusBarMessage('Starting Redis for VS Code...')
      if (process.platform === 'win32') {
        PSinst = cp.spawn('powershell.exe', [
          '-NoProfile',
          '-ExecutionPolicy', 'Bypass',
          '-NonInteractive',
          '-NoLogo',
          '-Command',
          '$env:NODE_ENV="production";'
          + `$env:RI_APP_FOLDER_NAME=${appFolder};`
          + `$env:RI_APP_PORT=${port};`
          + `$env:RI_APP_HOST=${appHost};`
          + `$env:RI_STDOUT_LOGGER=${process.env.RI_STDOUT_LOGGER};`
          + `$env:RI_BUILD_TYPE=${process.env.RI_BUILD_TYPE};`
          + `$env:RI_SEGMENT_WRITE_KEY=${process.env.RI_SEGMENT_WRITE_KEY};`
          + `$env:RI_MIGRATE_OLD_FOLDERS=${process.env.RI_MIGRATE_OLD_FOLDERS};`
          + '$env:RI_AUTO_BOOTSTRAP=true;'
          + `node ${backendSrcPath}`,
        ])
      } else {
        PSinst = cp.spawn(
          'node', [path.resolve(backendPath, 'main.js')],
          {
            env:
            {
              NODE_ENV: 'production',
              RI_APP_FOLDER_NAME: appFolder,
              RI_APP_PORT: port,
              RI_APP_HOST: appHost,
              RI_STDOUT_LOGGER: process.env.RI_STDOUT_LOGGER,
              RI_BUILD_TYPE: process.env.RI_BUILD_TYPE,
              RI_SEGMENT_WRITE_KEY: process.env.RI_SEGMENT_WRITE_KEY,
              RI_MIGRATE_OLD_FOLDERS: process.env.RI_MIGRATE_OLD_FOLDERS,
              RI_AUTO_BOOTSTRAP: 'true',
              PATH: process.env.PATH,
            },
          },
        )
      }
      PSinst.stdout.on('data', (data: Buffer) => {
        if (devEnv) {
          const infoData = data.toString()
          console.debug(infoData)
        }
      })
      checkServerReady(logger, port, () => {
        message.dispose()
        resolve('')
      })
    }
  })
}

export function closeBackend() {
  console.debug('Closing backend...')
  if (process.platform === 'win32') {
    const pid = PSinst.pid?.toString() as string
    cp.spawn('taskkill', ['/pid', pid, '/f', '/t'])
  } else {
    PSinst.stdin.end()
    PSinst.stdout.destroy()
    PSinst.stderr.destroy()
    PSinst.kill('SIGINT')
  }
}

function checkServerReady(logger: CustomLogger, port: string, callback: () => void) {
  const checker = setInterval(async () => {
    try {
      const url = `${appUrl}:${port}/${appPrefix}/info`
      logger.log(`checkServerReady: ${url}`)
      const res = await fetch(url)
      if (res.status === 200) {
        clearInterval(checker)
        callback()
      }
    } catch (err) {
      console.debug('Checking api...')
    }
  }, 1000)
}

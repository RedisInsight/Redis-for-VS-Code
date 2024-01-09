import * as vscode from 'vscode'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'
import { ChildProcessWithoutNullStreams } from 'child_process'

const apiUrl = process.env.RI_BASE_API_URL
const apiPort = process.env.RI_API_PORT
const apiPrefix = process.env.RI_API_PREFIX

const backendPath = path.join(__dirname, '..', 'redis-backend')
let PSinst: ChildProcessWithoutNullStreams

export function checkServerReady(callback: () => void) {
  const checker = setInterval(() => {
    fetch(`${apiUrl}:${apiPort}/${apiPrefix}/info`)
      .then((res) => {
        if (res.status === 200) {
          clearInterval(checker)
          callback()
        }
      }, () => {
        console.debug('checking server...')
      })
  }, 1000)
}

export async function startBackend(): Promise<any> {
  return new Promise((resolve) => {
    const backendSrcPath = path.join(backendPath, 'src/main.js')

    if (!fs.existsSync(backendPath)) {
      vscode.window.showErrorMessage('Can\'t find backend folder')
      console.debug('Can\'t find backend folder')
      resolve('')
    } else {
      vscode.window.showInformationMessage('Starting RedisInsight backend...')
      if (process.platform === 'win32') {
        PSinst = cp.spawn('powershell.exe', [
          '-NoProfile',
          '-ExecutionPolicy', 'Bypass',
          '-NonInteractive',
          '-NoLogo',
          '-Command',
          // eslint-disable-next-line max-len
          `$env:APP_FOLDER_NAME=".redisinsight-vsc";$env:NODE_ENV="production";$env:STDOUT_LOGGER="true";$env:BUILD_TYPE="DOCKER_ON_PREMISE";node ${backendSrcPath}`,
        ])
      } else {
        PSinst = cp.spawn(
          'node', [path.resolve(backendPath, 'src/main.js')],
          { env: { APP_FOLDER_NAME: '.redisinsight-vsc', NODE_ENV: 'production', BUILD_TYPE: 'DOCKER_ON_PREMISE', PATH: process.env.PATH } },
        )
      }
      checkServerReady(() => {
        resolve('')
      })
    }
  })
}

export function closeBackend() {
  console.debug('Closing backend...')
  PSinst?.kill()
}

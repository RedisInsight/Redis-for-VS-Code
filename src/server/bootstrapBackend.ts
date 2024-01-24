import * as vscode from 'vscode'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'
import { ChildProcessWithoutNullStreams } from 'child_process'

// TODO: add separate task builder to save env variables in production builds
const apiUrl = process.env.RI_BASE_API_URL || 'http://localhost'
// TODO: add port avialability checker instead of hardcode
const apiPort = process.env.RI_API_PORT || '5001'
const apiPrefix = process.env.RI_API_PREFIX || 'api'
const apiFolder = process.env.RI_API_FOLDER || '.redisinsight-vsc'

const backendPath = path.join(__dirname, '..', 'redis-backend')
let PSinst: ChildProcessWithoutNullStreams

export function checkServerReady(callback: () => void) {
  const checker = setInterval(async () => {
    try {
      const res = await fetch(`${apiUrl}:${apiPort}/${apiPrefix}/info`)
      if (res.status === 200) {
        clearInterval(checker)
        callback()
      }
    } catch (err) {
      console.debug('checking api...')
    }
  }, 1000)
}

export async function startBackend(): Promise<any> {
  return new Promise((resolve) => {
    const backendSrcPath = path.join(backendPath, 'src/main.js')

    if (!fs.existsSync(backendPath)) {
      vscode.window.showErrorMessage('Can\'t find api folder')
      console.debug('Can\'t find api folder')
      resolve('')
    } else {
      const message = vscode.window.setStatusBarMessage('Starting RedisInsight...')
      if (process.platform === 'win32') {
        PSinst = cp.spawn('powershell.exe', [
          '-NoProfile',
          '-ExecutionPolicy', 'Bypass',
          '-NonInteractive',
          '-NoLogo',
          '-Command',
          // eslint-disable-next-line max-len
          `$env:APP_FOLDER_NAME=${apiFolder};$env:NODE_ENV="production";$env:STDOUT_LOGGER="true";$env:BUILD_TYPE="DOCKER_ON_PREMISE";node ${backendSrcPath}`,
        ])
      } else {
        PSinst = cp.spawn(
          'node', [path.resolve(backendPath, 'src/main.js')],
          { env: { APP_FOLDER_NAME: apiFolder, NODE_ENV: 'production', STDOUT_LOGGER: 'true', BUILD_TYPE: 'DOCKER_ON_PREMISE', PATH: process.env.PATH, APP_PORT: apiPort } },
        )
      }
      // TODO: make it visible only for dev env
      PSinst.stdout.on('data', (data: Buffer) => {
        const infoData = data.toString()
        console.debug(infoData)
      })
      checkServerReady(() => {
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

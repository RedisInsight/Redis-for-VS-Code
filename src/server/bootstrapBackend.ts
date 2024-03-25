import * as vscode from 'vscode'
import * as getPort from 'detect-port'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'
import { ChildProcessWithoutNullStreams } from 'child_process'

const devEnv = process.env.NODE_ENV === 'development'

const apiUrl = process.env.RI_BASE_API_URL
const apiPort = process.env.RI_APP_PORT
const apiPrefix = process.env.RI_APP_PREFIX
const apiFolder = process.env.RI_APP_FOLDER

const backendPath = path.join(__dirname, '..', 'redis-backend')
let PSinst: ChildProcessWithoutNullStreams

export async function startBackend(context: vscode.ExtensionContext): Promise<any> {
  const port = await (await getPort.default(+apiPort!)).toString()
  console.debug(`Starting at port: ${port}`)
  context.globalState.update('API_PORT', port)

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
          '$env:NODE_ENV="production";'
          + `$env:RI_APP_FOLDER_NAME=${apiFolder};`
          + `$env:RI_APP_PORT=${port};`
          + `$env:RI_STDOUT_LOGGER=${process.env.RI_STDOUT_LOGGER};`
          + `$env:RI_BUILD_TYPE=${process.env.RI_BUILD_TYPE};`
          + `$env:RI_SEGMENT_WRITE_KEY=${process.env.RI_SEGMENT_WRITE_KEY};`
          + `node ${backendSrcPath}`,
        ])
      } else {
        PSinst = cp.spawn(
          'node', [path.resolve(backendPath, 'src/main.js')],
          {
            env:
            {
              NODE_ENV: 'production',
              RI_APP_FOLDER_NAME: apiFolder,
              RI_APP_PORT: port,
              RI_STDOUT_LOGGER: process.env.RI_STDOUT_LOGGER,
              RI_BUILD_TYPE: process.env.RI_BUILD_TYPE,
              RI_SEGMENT_WRITE_KEY: process.env.RI_SEGMENT_WRITE_KEY,
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
      checkServerReady(port, () => {
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

function checkServerReady(port: string, callback: () => void) {
  const checker = setInterval(async () => {
    try {
      const res = await fetch(`${apiUrl}:${port}/${apiPrefix}/info`)
      if (res.status === 200) {
        clearInterval(checker)
        callback()
      }
    } catch (err) {
      console.debug('Checking api...')
    }
  }, 1000)
}

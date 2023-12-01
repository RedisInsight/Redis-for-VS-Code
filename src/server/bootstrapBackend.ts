import * as vscode from 'vscode'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'
import { ChildProcessWithoutNullStreams } from 'child_process'

const backendPath = path.join(__dirname, '..', 'redis-backend')
let PSinst: ChildProcessWithoutNullStreams

export async function startBackend(): Promise<any> {
  return new Promise((resolve) => {
    const backendSrcPath = path.join(backendPath, 'src/main.js')

    if (!fs.existsSync(backendPath)) {
      vscode.window.showErrorMessage('Can\'t find backend folder')
      console.debug('Can\'t find backend folder')
      resolve('')
    } else {
      vscode.window.showInformationMessage('Staring RedisInsight backend...')
      if (process.platform === 'win32') {
        PSinst = cp.spawn('powershell.exe', [
          '-NoProfile',
          '-ExecutionPolicy', 'Bypass',
          '-NonInteractive',
          '-NoLogo',
          '-Command',
          `$env:BUILD_TYPE="DOCKER_ON_PREMISE";node ${backendSrcPath}`,
        ])
      } else {
        PSinst = cp.spawn(
          'node', [path.resolve(backendPath, 'src/main.js')],
          { env: { BUILD_TYPE: 'DOCKER_ON_PREMISE', PATH: process.env.PATH } },
        )
      }
      PSinst.stdout.on('data', (data: Buffer) => {
        const infoData = data.toString()
        console.debug(infoData)
        if (infoData.includes('application successfully started')) {
          resolve('')
        }
      })
    }
  })
}

export function closeBackend() {
  console.debug('Closing backend...')
  PSinst?.kill()
}

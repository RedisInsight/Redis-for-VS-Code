import * as vscode from 'vscode'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'
import { parse as parseUrl } from 'url'

const cdnPath = 'https://download.redisinsight.redis.com/latest/redisstack/'
const backendPath = path.join(__dirname, `redis-backend-${process.platform}-${process.arch}`)

export const backendBootstrap = async () => {
  const serverLocation = await downloadAndUnzipRedisInsightServer(process.platform, backendPath)
  // eslint-disable-next-line no-console
  console.log(serverLocation)
}

function ensureFolderExists(loc: string) {
  if (!fs.existsSync(loc)) {
    const parent = path.dirname(loc)
    if (parent) {
      ensureFolderExists(parent)
    }
    fs.mkdirSync(loc)
  }
}

function getDownloadUrl(): string {
  // Download temporary possible only for non-windows platforms
  if (process.platform !== 'win32') {
    return `${cdnPath}/RedisInsight-v2-web-${process.platform}.${process.arch}.tar.gz`
  } return path.join(__dirname, 'redis-backend-win32-x64.zip')
}

async function downloadRedisBackendArchive(
  platform: string,
  destDir: string,
): Promise<string> {
  ensureFolderExists(destDir)
  const downloadUrl = getDownloadUrl()

  return new Promise((resolve, reject) => {
    const requestOptions: https.RequestOptions = parseUrl(downloadUrl)

    // --- Current windows archive located inside of the app, no need to download --- //
    if (process.platform !== 'win32') {
      vscode.window.showInformationMessage('Downloading RedisInsight backend...')
      https.get(requestOptions, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error('Failed to get RedisInsight backend archive location'))
        }

        // Expected that windows distribution package will be zipped
        if (downloadUrl.endsWith('.zip')) {
          const archivePath = path.resolve(destDir, `redisinsight-backend-${platform}.zip`)
          const outStream = fs.createWriteStream(archivePath)
          outStream.on('close', () => {
            resolve(archivePath)
          })
          https.get(downloadUrl, (res) => {
            res.pipe(outStream)
          })
        } else { // Other non-windows distribution packages
          const zipPath = path.resolve(destDir, `redisinsight-backend-${platform}.tar.gz`)
          const outStream = fs.createWriteStream(zipPath)
          https.get(downloadUrl, (res) => {
            res.pipe(outStream)
          })
          outStream.on('close', () => {
            resolve(zipPath)
          })
        }
      })
    } else resolve(downloadUrl)
  })
}

function unzipRedisServer(redisInsideArchivePath: string, extractDir: string) {
  vscode.window.showInformationMessage('Extracting RedisInsight backend files...')
  if (redisInsideArchivePath.endsWith('.zip')) {
    if (process.platform === 'win32') {
      cp.spawnSync('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-NonInteractive',
        '-NoLogo',
        '-Command',
        `Microsoft.PowerShell.Archive\\Expand-Archive -Path "${redisInsideArchivePath}" -DestinationPath "${extractDir}"`,
      ])
    } else {
      cp.spawnSync('unzip', [redisInsideArchivePath, '-d', `${extractDir}`])
    }
  } else {
    // tar does not create extractDir by default
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir)
    }
    cp.spawnSync('tar', ['-xzf', redisInsideArchivePath, '-C', extractDir, '--strip-components', '2', 'api/dist'])
  }
}

export async function downloadAndUnzipRedisInsightServer(platform: string, backendPath: string): Promise<string> {
  if (fs.existsSync(backendPath)) {
    vscode.window.showInformationMessage('Found RedisInsight backend. Skipping download.')
  } else {
    try {
      const redisInsightArchivePath = await downloadRedisBackendArchive(platform, backendPath)
      if (fs.existsSync(redisInsightArchivePath)) {
        unzipRedisServer(redisInsightArchivePath, backendPath)
        // Remove archive for non-windows platforms
        if (process.platform !== 'win32') fs.unlinkSync(redisInsightArchivePath)
      }
    } catch (err) {
      fs.rmdir(backendPath, () => { })
      throw Error('Failed to download and unzip Redis backend')
    }
  }
  return Promise.resolve(backendPath)
}

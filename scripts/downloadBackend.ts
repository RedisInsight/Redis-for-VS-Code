import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'
import * as dotenv from 'dotenv'
import { parse as parseUrl } from 'url'

dotenv.config({
  path: [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env'),
  ]
})
const cdnPath = process.env.RI_CDN_PATH
const backendPath = path.join(__dirname, '..', 'dist', 'redis-backend')
const staticPath = path.join(backendPath, 'static')
const tempWindowsDistPath = process.env.RI_TEMP_WINDOWS_DIST_PATH as string

const downloadBackend = async () => {
  if (fs.existsSync(backendPath)) {
    console.debug('Backend folder already exists, deleting...')
    fs.rmSync(backendPath, { recursive: true, force: true });
  }
  console.debug('Downloading and unpacking, it will takes some time - please be patient...')
  try {
    const redisInsightArchivePath = await downloadRedisBackendArchive(process.platform, backendPath)
    if (fs.existsSync(redisInsightArchivePath)) {
      unzipRedisServer(redisInsightArchivePath, backendPath)
      // Remove archive for non-windows platforms
      if (process.platform !== 'win32') fs.unlinkSync(redisInsightArchivePath)
      console.debug('Done!')
    }
  } catch (err) {
    console.debug('Failed to download Redis Insight backend')
    fs.rmdir(backendPath, () => { })
    throw Error('Failed to download and unzip Redis backend')
  }
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
  // Download is temporary available only for non-windows platforms
  if (process.platform !== 'win32') {
    return `${cdnPath}/Redis-Insight-web-${process.platform}.${process.arch}.tar.gz`
  } return tempWindowsDistPath
}

async function downloadRedisBackendArchive(
  platform: string,
  destDir: string,
): Promise<string> {
  ensureFolderExists(destDir)
  const downloadUrl = getDownloadUrl()

  return new Promise((resolve, reject) => {
    const requestOptions: https.RequestOptions = parseUrl(downloadUrl)
    https.get(requestOptions, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('Failed to get Redis Insight backend archive location'))
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
  })
}

function unzipRedisServer(redisInsideArchivePath: string, extractDir: string) {
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
    // Temporary: there's no some dependencies in current dist's, starting re-install
    cp.spawnSync('yarn', ['--cwd', extractDir, 'install'])

    // remove plugins
    fs.rmSync(staticPath, { recursive: true, force: true });
  }
}

downloadBackend()

// import * as express from 'express'
import express from 'express'
import * as bodyParser from 'body-parser'
import * as keytar from 'keytar'
// import { Server } from 'socket.io'
import Redis from 'ioredis'
import { verbose } from 'sqlite3'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { exec } from 'node:child_process'

import * as http from 'http'
// import { convertRedisInfoReplyToObject } from './utils'

const dbPath = path.join(os.homedir(), '.ri-vsc', 'ri.db')
const sqlite3 = verbose()

exec('echo "The \\$HOME variable is $HOME"', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`)
    return
  }
  console.error(`stderr: ${stderr}`)
})

// Create and connect to the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message)
  } else {
    console.debug('Connected to the database')
    // Create a table to store user data if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY,
        url TEXT
    )`)
  }
})

export const bootstrap = () => {
  const app = express()
  const server = http.createServer(app)
  // const io = new Server(server, {
  //   cors: {
  //     origin: '*',
  //   },
  // })

  app.all('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
  })

  // Enable JSON body parsing
  app.use(bodyParser.json())

  app.get('/', (req, res) => {
    res?.send('Hello from your embedded Express server!')
  })

  app.get('/url', async (req, res) => {
    try {
      const storedUrl = await keytar.getPassword('ri-vsc', 'url')

      if (storedUrl) {
        res.status(200).json(storedUrl)
      } else {
        res?.status(404).json({ error: 'No stored server response found' })
      }
    } catch (error) {
      res?.status(404).json({ error })
    }
  })

  app.post('/connect', async (req, res) => {
    const { url } = req.body

    console.debug('HTTP url:', url)

    const { total, keys } = await getKeys(url, res)

    res.status(200).json({ total, keys })
  })

  // io.on('connection', (socket: any) => {
  //   console.debug('Client connected')

  //   socket.on('getKeys', async (url: any) => {
  //     try {
  //       console.debug('Socket url:', url)
  //       const { total, keys } = await getKeys(url)

  //       socket.emit('getKeysSaved', { total, keys })
  //     } catch (err) {
  //       const error = err as Error
  //       socket.emit('getKeysError', `Error get keys: ${error.message}`)
  //     }
  //   })

  //   socket.on('disconnect', () => {
  //     console.debug('Client disconnected')
  //   })
  // })

  console.debug('server is running')

  server.listen(3000)
}

const getKeys = async (url: string, res?: any) => {
  let total; let keys; let
    redis: any

  try {
    redis = new Redis(url)
  } catch (error) {
    res?.status(500).json({ error: 'Error connect to Redis' })
  }

  try {
    await keytar.setPassword('ri-vsc', 'url', url)
  } catch (error) {
    res?.status(500).json({ error })
  }

  try {
    [total, keys] = await redis.scan(0)
    // res.status(200).json({ info: convertRedisInfoReplyToObject(info) })
    res.status(200).json({ total, keys })
  } catch (error) {
    res?.status(500).json({ error: 'Error to fetch keys' })
  }

  // workspace folder store file
  // try {
  //   const workspaceFolders = vscode.workspace.workspaceFolders
  //   if (!workspaceFolders || workspaceFolders.length === 0) {
  //       vscode.window.showErrorMessage('No workspace folders found.')
  //       return
  //   }

  //   const storedUrl = await keytar.getPassword('ri-vsc', 'url')
  //   const activeWorkspaceFolder = workspaceFolders[0]
  //   const filePath = vscode.Uri.joinPath(activeWorkspaceFolder.uri, 'keys.txt')

  //   // Write the user data to the text file in the workspace
  //   await vscode.workspace.fs.writeFile(filePath, Buffer.from(JSON.stringify({ storedUrl, keys, url }, null, 2)))
  // } catch (error) {
  //   res?.status(500).json({ error: 'Error failed stored file' })
  // }

  try {
    // Determine the absolute path for storing the file
    const filePath = path.join(os.homedir(), '.ri-vsc', 'keys.txt')

    // Save the user data as a text file
    fs.writeFileSync(filePath, JSON.stringify({ keys, url }, null, 2), 'utf8')
  } catch (error) {
    res?.status(500).json({ error: 'Error failed stored file' })
  }

  try {
    db.run('INSERT INTO urls (url) VALUES (?)', [url], (err) => {
      if (err) {
        console.error('Error inserting data into the database:', err.message)
        // socket.emit('userDataError', `Error saving user data: ${err.message}`)
      } else {
        console.debug('db inserted')
        // socket.emit('userDataSaved', 'User data saved successfully')
      }
    })
  } catch (error) {
    res?.status(500).json({ error: 'Error failed stored in the sqlite3 db' })
  }

  setTimeout(() => {
    redis.disconnect()
  }, 1_000)

  return { total, keys }
}

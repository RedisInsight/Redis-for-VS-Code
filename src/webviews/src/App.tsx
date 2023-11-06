import React, { FunctionComponent, useEffect } from 'react'
import { VscFlame } from 'react-icons/vsc'
import { Link } from 'react-router-dom'

import { useVSCodeState } from 'uiSrc/store'
import { vscodeApi } from 'uiSrc/services'

type AppProps = {}

const headers = {
  'Content-Type': 'application/json',
  Origin: 'http://localhost:3000',
}

// const vscode = acquireVsCodeApi()

const App: FunctionComponent<AppProps> = () => {
  const [val, setVal] = useVSCodeState<string>('', 'val')
  const [keys, setKeys] = useVSCodeState<string[]>([], 'keys')

  useEffect(() => {
    const getUrl = async () => {
      const response = await fetch(
        'http://localhost:3000/url',
        {
          method: 'GET',
          headers,
        },
      )
      const url = await response.json() || ''

      setVal(url)
    }

    console.debug({ val })

    getUrl()
    handleConnect()

    return () => {
      setKeys([])
    }
  }, [])

  const handleConnect = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/connect',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            url: 'redis://default:1@redis-10175.c295.ap-southeast-1-1.ec2.cloud.redislabs.com:10175',
          }),
        },
      )

      const { keys } = await response.json()

      setKeys(keys)
      vscodeApi.setState({ keys })
    } catch (err) {
      console.debug({ err })
    }
  }

  return (
    <div className="p-2 flex flex-col space-y-2">
      <div className="text-2xl font-bold text-vscode-settings-headerForeground">
        Welcome to RedisInsight!
      </div>
      <div className="text-base text-vscode-foreground flex items-baseline">
        <div className="text-vscode-button-foreground mr-2">
          <VscFlame />
          <Link to="/tree">Tree</Link>
        </div>
      </div>
      {!!keys?.length && (
        <div className="text-2xl font-bold text-vscode-settings-headerForeground">
          Keys:
        </div>
      )}
      {!!keys?.length && keys.map((key) => (<div>{key}</div>))}

    </div>
  )
}

export default App

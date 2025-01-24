import * as vscode from 'vscode'
import { cloudOauthCallback } from '../lib/auth/auth.handler'

export async function registerUriHandler() {
  vscode.window.registerUriHandler({ handleUri })
}

async function handleUri(uri: vscode.Uri) {
  const query = Object.fromEntries(new URLSearchParams(uri.query))
  // const query = parse(uri.query)

  if (uri.path.startsWith('/cloud/oauth/callback')) {
    await cloudOauthCallback(query)
    return
  }

  if (uri.path.startsWith('/databases/connect')) {
    // sidebarProvider.view?.webview.postMessage({ action: 'oauthConnect' })
  }
}

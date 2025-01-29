import * as vscode from 'vscode'
import { cloudOauthCallback } from '../lib/auth/auth.handler'
import { UrlHandlingActions } from '../constants'

export async function registerUriHandler() {
  vscode.window.registerUriHandler({ handleUri })
}

async function handleUri(uri: vscode.Uri) {
  if (uri.path.startsWith(UrlHandlingActions.OAuthCallback)) {
    const query = Object.fromEntries(new URLSearchParams(uri.query))
    await cloudOauthCallback(query)
    return
  }

  // TODO: add database from oath callback url
  if (uri.path.startsWith(UrlHandlingActions.Connect)) {
    // sidebarProvider.view?.webview.postMessage({ action: 'SetSearchUrl', data: uri.query })
  }
}

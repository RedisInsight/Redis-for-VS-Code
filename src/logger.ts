import * as vscode from 'vscode'
import { EXTENSION_NAME } from './constants'

const channelName = EXTENSION_NAME
export class CustomLogger {
  private outputChannel: vscode.OutputChannel

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel(channelName)
  }

  log(message: string): void {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp} - ${message}`
    this.outputChannel.appendLine(logMessage)
  }

  logOAuth(message: string): void {
    this.log(`[Service Auth] ${message}`)
  }

  logServer(message: string): void {
    this.log(`[Server] ${message}`)
  }

  logCore(message: string): void {
    this.log(`[Core] ${message}`)
  }

  show(): void {
    this.outputChannel.show()
  }
}

export const logger = new CustomLogger()

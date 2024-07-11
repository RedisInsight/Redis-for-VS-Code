import * as vscode from 'vscode'

const channelName = 'Redis Insight'
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

  show(): void {
    this.outputChannel.show()
  }
}

export const logger = new CustomLogger()

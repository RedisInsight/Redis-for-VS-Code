import * as vscode from 'vscode'

class WorkspaceStateService {
  private readonly context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  get<T>(key: string = ''): T | null {
    let item
    try {
      item = this.context.workspaceState.get<T>(key)
    } catch (error) {
      console.error(`get from workspace state error: ${error}`)
    }

    return item || null
  }

  async set(key: string = '', item: any) {
    try {
      await this.context.workspaceState.update(key, item)
    } catch (error) {
      console.error(`update to workspace state error: ${error}`)
    }
  }

  async remove(key: string = '') {
    await this.context.workspaceState.update(key, null)
  }

  getAll() {
    return this.context.workspaceState.keys()
  }
}

export const initWorkspaceState = async (context: vscode.ExtensionContext) => {
  workspaceStateService = new WorkspaceStateService(context)

  // clear app cache
  await workspaceStateService.remove('appPort')
  await workspaceStateService.remove('appInfo')
}

// eslint-disable-next-line import/no-mutable-exports
export let workspaceStateService: WorkspaceStateService

export { WorkspaceStateService }

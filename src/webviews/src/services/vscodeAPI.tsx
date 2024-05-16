import { get, omit } from 'lodash'
import { VscodeStateItem } from 'uiSrc/constants'
import { IVSCodeApi, PostMessage } from 'uiSrc/interfaces'

class VSCodeWrapper {
  public readonly vscodeApi: IVSCodeApi = window.acquireVsCodeApi?.()

  /**
   * Send a message to the extension framework.
   * @param message
   */
  public postMessage(message: PostMessage): void {
    this.vscodeApi?.postMessage(message)
  }

  public getState = (): any => this.vscodeApi?.getState() ?? {}

  public setState = (newState: any): any => this.vscodeApi?.setState(newState)

  public getItem = (name: VscodeStateItem | string): any => get(this.vscodeApi.getState(), name)

  public setItem = (name: VscodeStateItem | string, value: any): any => this.vscodeApi.setState({ ...vscodeApi.getState(), [name]: value })

  public removeItem = (name: VscodeStateItem | string): any => this.vscodeApi.setState(omit(vscodeApi.getState(), [name]))
}

// Singleton to prevent multiple fetches of vscodeApi.
const vscodeApi = new VSCodeWrapper()
export { vscodeApi }

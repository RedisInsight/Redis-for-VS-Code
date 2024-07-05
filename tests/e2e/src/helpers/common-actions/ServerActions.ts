import { CommonDriverExtension } from '../CommonDriverExtension'
import { CommonAPIRequests } from '../api'

/**
 * Database details actions
 */
export class ServerActions extends CommonDriverExtension {
  /**
   * Wait for server initialization
   * // todo: investigate if it is better to put it before all tests?
   */
  static async waitForServerInitialized(): Promise<void> {
    const TIMEOUT = 10_000
    const start = Date.now()

    while(Date.now() - start < TIMEOUT) {
      try {
        await CommonAPIRequests.sendGetRequest('/info')
        return
      } catch (e) {
        // ignore
      }

      await new Promise((res) => setTimeout(res, 500))
    }

    throw new Error(`Server is not ready after ${TIMEOUT}`)
  }
}

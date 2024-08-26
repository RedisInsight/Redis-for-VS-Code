import { expect } from 'chai'
import { CommonAPIRequests } from './CommonApi'

export class Eula {
  /**
   * Accept eula
   */
  static async accept(): Promise<void> {
    const spec = { agreements: { analytics: true, notifications: true, eula: true, encryption: false } }
    const response = await CommonAPIRequests.sendPatchRequest(
      `/settings`,
      spec,
    )
    expect(await response.status).eql(200)
  }

  /**
   * Reset eula
   */
    static async reset(): Promise<void> {
      const spec = { agreements: { analytics: false, notifications: false, eula: false, encryption: false } }
      const response = await CommonAPIRequests.sendPatchRequest(
        `/settings`,
        spec,
      )
      expect(await response.status).eql(200)
    }
}

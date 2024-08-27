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
}

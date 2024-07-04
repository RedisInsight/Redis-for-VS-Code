import { expect } from 'chai'
import { CommonAPIRequests } from './CommonApi'

export class Eula {
  /**
   * Accept eula
   */
  static async accept(): Promise<void> {
    const spec = { agreements: { analytics: true, notifications: true, encryption: true, eula: true } }
    const response = await CommonAPIRequests.sendPatchRequest(
      `/settings`,
      spec,
    )
    console.log('response message: ', await response)
    expect(await response.status).eql(200)
  }
}

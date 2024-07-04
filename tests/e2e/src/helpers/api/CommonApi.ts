import * as request from 'supertest'
import { Common } from '../Common'

const endpoint = Common.getEndpoint()
const jsonType = 'application/json'

export class CommonAPIRequests {
  /**
   * Send GET request using API
   * @param resourcePath URI path segment
   */
  static async sendGetRequest(resourcePath: string): Promise<any> {
    try {
      const response = await request(endpoint)
        .get(resourcePath)
        .set('Accept', jsonType)

      return response
    } catch (error) {
      throw new Error(`Failed to send GET request: ${error}`)
    }
  }

  /**
   * Send POST request using API
   * @param resourcePath URI path segment
   * @param body Request body
   */
  static async sendPostRequest(
    resourcePath: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    let requestEndpoint: any
    try {
      requestEndpoint = await request(endpoint)
        .post(resourcePath)
        .send(body)
        .set('Accept', jsonType)

      return requestEndpoint
    } catch (error: any) {
      throw new Error(`Failed to send POST request: ${error}`)
    }
  }

  /**
   * Send DELETE request using API
   * @param resourcePath URI path segment
   * @param body Request body
   */
  static async sendDeleteRequest(
    resourcePath: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    let requestEndpoint: any
    try {
      requestEndpoint = await request(endpoint)
        .delete(resourcePath)
        .send(body)
        .set('Accept', jsonType)

      return requestEndpoint
    } catch (error: any) {
      throw new Error(`Failed to send DELETE request: ${error}`)
    }
  }

  /**
   * Send PATCH request using API
   * @param resourcePath URI path segment
   * @param body Request body
   */
  static async sendPatchRequest(
    resourcePath: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    let requestEndpoint: any
    try {
      console.log(`Attempt to send PATCH request to:`, endpoint + resourcePath)
      console.log('Request body:', body)
      requestEndpoint = await request(endpoint)
        .patch(resourcePath)
        .send(body)
        .set('Accept', jsonType)
      console.log('Response status:', requestEndpoint.status)
      console.log('Response body:', requestEndpoint.body)

      return requestEndpoint
    } catch (error: any) {
      throw new Error(`Failed to send PATCH request: ${error}`)
    }
  }

  /**
   * Send PUT request using API
   * @param resourcePath URI path segment
   * @param body Request body
   */
  static async sendPutRequest(
    resourcePath: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    try {
      const requestEndpoint = await request(endpoint)
        .put(resourcePath)
        .send(body)
        .set('Accept', jsonType)

      return requestEndpoint
    } catch (error) {
      throw new Error(`Failed to send PUT request: ${error}`)
    }
  }
}

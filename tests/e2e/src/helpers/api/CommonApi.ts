import * as request from 'supertest'
import { Common } from '../Common'
const axios = require('axios');

const endpoint = Common.getEndpoint()
const jsonType = 'application/json'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: endpoint,
  headers: {
    'Accept': jsonType, // Replace jsonType with the actual content type if different
  },
});

// Request interceptor to log requests
axiosInstance.interceptors.request.use((request: { method: string; url: any; headers: any; data: any; }) => {
  console.log(`Request: ${request.method.toUpperCase()} ${request.url}`);
  console.log('Request headers:', request.headers);
  console.log('Request body:', request.data);
  return request;
});

// Response interceptor to log responses
axiosInstance.interceptors.response.use((response: { status: any; statusText: any; data: any; }) => {
  console.log(`Response: ${response.status} ${response.statusText}`);
  console.log('Response data:', response.data);
  return response;
}, (error: { response: { data: any; }; message: any; }) => {
  console.error('Error response:', error.response ? error.response.data : error.message);
  return Promise.reject(error);
});

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
      // requestEndpoint = await request(endpoint)
      //   .patch(resourcePath)
      //   .send(body)
      //   .set('Accept', jsonType)
      requestEndpoint = await axiosInstance.patch(resourcePath, body);
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

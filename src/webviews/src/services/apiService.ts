import axios, { AxiosRequestConfig } from 'axios'
import { isNumber } from 'lodash'
import { sessionStorageService } from 'uiSrc/services'
import { StorageItem, CustomHeaders } from 'uiSrc/constants'

export const BASE_API_URL = process.env.BASE_API_URL || 'http://localhost'
export const API_PORT = process.env.BASE_API_URL || '5001'
export const API_PREFIX = process.env.API_PREFIX || 'api'
export const BASE_URL = `${BASE_API_URL}:${API_PORT}/${API_PREFIX}/`

// axios.defaults.adapter = require('axios/lib/adapters/http')

const axiosInstance = axios.create({
  baseURL: BASE_URL,
})

export const requestInterceptor = (config: AxiosRequestConfig): any => {
  if (config?.headers) {
    const instanceId = /databases\/([\w-]+)\/?.*/.exec(config.url || '')?.[1]

    if (instanceId) {
      const dbIndex = sessionStorageService.get(`${StorageItem.dbIndex}${instanceId}`)

      if (isNumber(dbIndex)) {
        config.headers[CustomHeaders.DbIndex] = dbIndex
      }
    }

    // TODO: security windowId
    // if (window.windowId) {
    //   config.headers[CustomHeaders.WindowId] = window.windowId
    // }
  }

  return config
}

axiosInstance.interceptors.request.use(
  requestInterceptor,
  (error) => Promise.reject(error),
)

export default axiosInstance

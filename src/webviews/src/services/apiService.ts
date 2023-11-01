import axios, { AxiosRequestConfig } from 'axios'
import { isNumber } from 'lodash'
import { sessionStorageService } from 'uiSrc/services'
import { StorageItem, CustomHeaders } from 'uiSrc/constants'

const baseApiUrl = process.env.BASE_API_URL || 'http://localhost'
const apiPort = process.env.BASE_API_URL || '5001'
const apiPrefix = process.env.API_PREFIX || 'api'

// axios.defaults.adapter = require('axios/lib/adapters/http')

const axiosInstance = axios.create({
  baseURL: `${baseApiUrl}:${apiPort}/${apiPrefix}/`,
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

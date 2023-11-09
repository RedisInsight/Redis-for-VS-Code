import axios, { AxiosRequestConfig } from 'axios'
import { isNumber } from 'lodash'
import { sessionStorageService } from 'uiSrc/services'
import { StorageItem, CustomHeaders, BASE_URL } from 'uiSrc/constants'

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

import axios, { AxiosRequestConfig } from 'axios'
import { isNumber } from 'lodash'
import { CustomHeaders, BASE_URL } from 'uiSrc/constants'
import { getEncoding } from 'uiSrc/utils'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
})

export const requestInterceptor = (config: AxiosRequestConfig): any => {
  if (config?.headers) {
    const databaseId = /databases\/([\w-]+)\/?.*/.exec(config.url || '')?.[1]

    if (databaseId) {
      const dbIndex = window.ri?.database?.db
      const encoding = getEncoding()

      if (isNumber(dbIndex)) {
        config.headers[CustomHeaders.DbIndex] = dbIndex
      }

      if (encoding) {
        config.params = {
          encoding,
          ...config.params,
        }
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

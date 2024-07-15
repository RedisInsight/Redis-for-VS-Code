import axios from 'axios'
import { BASE_RESOURCES_URL } from 'uiSrc/constants'
import { IS_ABSOLUTE_PATH } from 'uiSrc/utils'

export const resourcesService = axios.create({
  baseURL: BASE_RESOURCES_URL,
})

// TODO: it seems it's shoudn't be location.origin
// TODO: check all cases and rename this to getResourcesUrl
// TODO: also might be helpful create function which returns origin url
export const getOriginUrl = () => (IS_ABSOLUTE_PATH.test(BASE_RESOURCES_URL)
  ? BASE_RESOURCES_URL
  : (window?.location?.origin || BASE_RESOURCES_URL))

export const getPathToResource = (url: string = ''): string => {
  try {
    return IS_ABSOLUTE_PATH.test(url) ? url : new URL(url, getOriginUrl()).toString()
  } catch {
    return ''
  }
}

export const checkResource = async (url: string = '') => resourcesService.head(url)

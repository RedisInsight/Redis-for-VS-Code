import { ApiEndpoints } from 'uiSrc/constants'

export const getUrl = (...path: string[]) => `/${ApiEndpoints.DATABASES}/${path.join('/')}`

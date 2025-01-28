import React from 'react'
import reactElementToJSXString from 'react-element-to-jsx-string'

import * as utils from 'uiSrc/utils/notifications/toasts'
import { CloudJobName, CloudJobStatus, CloudJobStep, CustomErrorCodes } from 'uiSrc/constants'
import { INFINITE_MESSAGES } from 'uiSrc/components'
import { OAuthStore } from 'uiSrc/store/hooks/use-oauth/interface'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import { cleanup, render } from 'testSrc/helpers'
import OAuthJobs from './OAuthJobs'

vi.spyOn(utils, 'showInfinityToast')
vi.spyOn(utils, 'showErrorInfinityToast')

const customState: OAuthStore = {
  ...initialOAuthState,
  showProgress: true,
  job: {
    ...initialOAuthState.job,
    status: '',
    name: undefined,
    id: '1',
  },
}

beforeEach(() => {
  useOAuthStore.setState({ ...customState })
  cleanup()
  vi.resetAllMocks()
})

describe('OAuthJobs', () => {
  it('should render', () => {
    expect(render(<OAuthJobs />)).toBeTruthy()
  })

  it('should call showInfinityToast when status changed to "running"', async () => {
    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Running,
      },
    })

    const { rerender } = render(<OAuthJobs />)

    rerender(<OAuthJobs />)

    const expected = reactElementToJSXString(INFINITE_MESSAGES.PENDING_CREATE_DB().Inner)
    const actual = reactElementToJSXString(utils.showInfinityToast.mock.calls[0][0])

    expect(actual).toEqual(expected)
  })

  it('should not call showInfinityToast the second time when status "running"', async () => {
    const { rerender } = render(<OAuthJobs />)

    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Running,
      },
    })

    rerender(<OAuthJobs />)

    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Running,
        id: '323123',
      },
    })

    rerender(<OAuthJobs />)

    const expected = reactElementToJSXString(INFINITE_MESSAGES.PENDING_CREATE_DB().Inner)
    const actual = reactElementToJSXString(utils.showInfinityToast.mock.calls[0][0])

    expect(actual).toEqual(expected)
  })

  it('should call loadInstances and setJob when status changed to "finished" without error', async () => {
    const resourceId = '123123'

    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Finished,
        step: CloudJobStep.Database,
        name: CloudJobName.ImportFreeDatabase,
        result: { resourceId },
      },
    })

    render(<OAuthJobs />)

    const expected = reactElementToJSXString(INFINITE_MESSAGES.SUCCESS_CREATE_DB(CloudJobName.ImportFreeDatabase).Inner)
    const actual = reactElementToJSXString(utils.showInfinityToast.mock.calls[0][0])

    expect(actual).toEqual(expected)

    expect(useOAuthStore.getState().job).toEqual({
      id: '',
      name: CloudJobName.CreateFreeSubscriptionAndDatabase,
      status: '',
    })
  })

  it('should call loadInstances and setJob when status changed to "finished" with error', async () => {
    const error = 'error'
    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Failed,
        error,
      },
    })

    render(<OAuthJobs />)

    expect(utils.showErrorInfinityToast).toHaveBeenCalledWith(error)

    expect(useOAuthStore.getState().ssoFlow).toEqual(undefined)
    expect(useOAuthStore.getState().isOpenSocialDialog).toEqual(false)
  })

  it('should call showInfinityToast and removeInfinityToast when errorCode is 11_108', async () => {
    const mockDatabaseId = '123'
    const error = {
      errorCode: CustomErrorCodes.CloudDatabaseAlreadyExistsFree,
      resource: {
        databaseId: mockDatabaseId,
      },
    }

    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Failed,
        error,
      },
    })

    render(<OAuthJobs />)

    const expected = reactElementToJSXString(INFINITE_MESSAGES.DATABASE_EXISTS().Inner)
    const actual = reactElementToJSXString(utils.showInfinityToast.mock.calls[0][0])

    expect(actual).toEqual(expected)

    expect(useOAuthStore.getState().ssoFlow).toEqual(undefined)
    expect(useOAuthStore.getState().isOpenSocialDialog).toEqual(false)
  })

  it('should call showInfinityToast and removeInfinityToast when errorCode is 11_114', async () => {
    const mockDatabaseId = '123'
    const error = {
      errorCode: CustomErrorCodes.CloudSubscriptionAlreadyExistsFree,
      resource: {
        databaseId: mockDatabaseId,
      },
    }

    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Failed,
        error,
      },
    })

    render(<OAuthJobs />)

    const expected = reactElementToJSXString(INFINITE_MESSAGES.SUBSCRIPTION_EXISTS().Inner)
    const actual = reactElementToJSXString(utils.showInfinityToast.mock.calls[0][0])

    expect(actual).toEqual(expected)

    expect(useOAuthStore.getState().ssoFlow).toEqual(undefined)
    expect(useOAuthStore.getState().isOpenSocialDialog).toEqual(false)
  })

  it('should call logoutUser when statusCode is 401', async () => {
    const mockDatabaseId = '123'
    const error = {
      statusCode: 401,
      errorCode: CustomErrorCodes.CloudSubscriptionAlreadyExistsFree,
      resource: {
        databaseId: mockDatabaseId,
      },
    }

    useOAuthStore.setState({
      ...customState,
      job: {
        ...customState.job,
        status: CloudJobStatus.Failed,
        error,
      },
    })

    render(<OAuthJobs />)

    const expected = reactElementToJSXString(INFINITE_MESSAGES.SUBSCRIPTION_EXISTS().Inner)
    const actual = reactElementToJSXString(utils.showInfinityToast.mock.calls[0][0])

    expect(actual).toEqual(expected)

    expect(useOAuthStore.getState().ssoFlow).toEqual(undefined)
    expect(useOAuthStore.getState().isOpenSocialDialog).toEqual(false)
  })
})

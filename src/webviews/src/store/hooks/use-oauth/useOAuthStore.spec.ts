import * as modules from 'uiSrc/modules'
import { CloudJobName, CloudJobStatus } from 'uiSrc/constants'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useOAuthStore,
  initialOAuthState,
  fetchUserInfo,
  createFreeDbJob,
} from './useOAuthStore'

beforeEach(() => {
  useOAuthStore.setState(initialOAuthState)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useOAuthStore', () => {
  it('getUserInfo', () => {
    // Arrange
    const { getUserInfo } = useOAuthStore.getState()
    // Act
    getUserInfo()
    // Assert
    expect(useOAuthStore.getState().user.loading).toEqual(true)
  })

  it('getUserInfoFinal', () => {
    // Arrange
    const initialState = { ...initialOAuthState, loading: true } // Custom initial state
    useOAuthStore.setState((state) => ({ ...state, ...initialState }))

    const { getUserInfoFinal } = useOAuthStore.getState()
    // Act
    getUserInfoFinal()
    // Assert
    expect(useOAuthStore.getState().user.loading).toEqual(false)
  })
  it('getUserInfoSuccess', () => {
    // Arrange
    const initialState = { ...initialOAuthState, loading: true } // Custom initial state
    useOAuthStore.setState((state) => ({ ...state, ...initialState }))

    const { getUserInfoSuccess } = useOAuthStore.getState()
    // Act
    getUserInfoSuccess(constants.USER_DATA)
    // Assert
    expect(useOAuthStore.getState().user.data).toEqual(constants.USER_DATA)
  })
})

describe('async', () => {
  it('fetchUserInfo', async () => {
    fetchUserInfo()
    await waitForStack()

    expect(useOAuthStore.getState().user.data).toEqual(constants.USER_DATA)
    expect(useOAuthStore.getState().user.loading).toEqual(false)
  })

  it('createFreeDbJob', async () => {
    const name = CloudJobName.CreateFreeSubscriptionAndDatabase
    createFreeDbJob({ name })
    await waitForStack()

    expect(useOAuthStore.getState().job).toEqual(
      { id: constants.USER_JOBS_DATA.id, name, status: CloudJobStatus.Running },
    )
  })
})

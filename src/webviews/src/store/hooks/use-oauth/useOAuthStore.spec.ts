import { CloudJobName, CloudJobStatus } from 'uiSrc/constants'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useOAuthStore,
  initialOAuthState,
  fetchUserInfo,
  createFreeDbJob,
  fetchCloudSubscriptionPlans,
} from './useOAuthStore'
import { CloudSubscriptionPlanResponse } from './interface'

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

  it('setIsRecommendedSettingsSSO', () => {
    const initialState = { ...initialOAuthState, plan: { isRecommendedSettings: true } }
    useOAuthStore.setState((state) => ({ ...state, ...initialState }))

    const { setIsRecommendedSettingsSSO } = useOAuthStore.getState()

    setIsRecommendedSettingsSSO(false)

    expect(useOAuthStore.getState().isRecommendedSettings).toEqual(false)
  })

  it('getPlans', () => {
    const initialState = { ...initialOAuthState, plan: { loading: false } }
    useOAuthStore.setState((state) => ({ ...state, ...initialState }))

    const { getPlans } = useOAuthStore.getState()

    getPlans()

    expect(useOAuthStore.getState().plan.loading).toEqual(true)
  })

  it('getPlansSuccess', () => {
    const initialState = { ...initialOAuthState, plan: { loading: true, data: [] } }
    useOAuthStore.setState((state) => ({ ...state, ...initialState }))

    const { getPlansSuccess } = useOAuthStore.getState()

    getPlansSuccess(constants.PLANS_DATA as CloudSubscriptionPlanResponse[])

    expect(useOAuthStore.getState().plan.data).toEqual(constants.PLANS_DATA)
    expect(useOAuthStore.getState().plan.loading).toEqual(false)
  })

  it('getPlansFailure', () => {
    const initialState = { ...initialOAuthState, plan: { loading: true } }
    useOAuthStore.setState((state) => ({ ...state, ...initialState }))

    const { getPlansFailure } = useOAuthStore.getState()

    getPlansFailure()

    expect(useOAuthStore.getState().plan.loading).toEqual(false)
  })

  it('setIsOpenSelectPlanDialog', () => {
    const initialState = { ...initialOAuthState, plan: { isOpenDialog: false } }
    useOAuthStore.setState((state) => ({ ...state, ...initialState }))

    const { setIsOpenSelectPlanDialog } = useOAuthStore.getState()

    setIsOpenSelectPlanDialog(true)

    expect(useOAuthStore.getState().plan.isOpenDialog).toEqual(true)
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

  it('fetchCloudSubscriptionPlans', async () => {
    fetchCloudSubscriptionPlans()
    await waitForStack()

    expect(useOAuthStore.getState().plan).toEqual(
      { isOpenDialog: true, data: constants.PLANS_DATA, loading: false },
    )
  })
})

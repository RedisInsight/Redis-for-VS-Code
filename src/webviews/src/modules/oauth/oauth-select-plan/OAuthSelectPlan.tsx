import { filter, find, first, toNumber } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { VscClose } from 'react-icons/vsc'
import Popup from 'reactjs-popup'
import { useShallow } from 'zustand/react/shallow'
import { CloudJobName, CloudJobStep, OAuthProvider } from 'uiSrc/constants'
import { createFreeDbJob, useOAuthStore } from 'uiSrc/store'
import { CloudSubscriptionPlanResponse, Region } from 'uiSrc/store/hooks/use-oauth/interface'
import { RiButton } from 'uiSrc/ui'
import { sendEventTelemetry, showInfinityToast, TelemetryEvent } from 'uiSrc/utils'

import { INFINITE_MESSAGES, SuperSelectOption } from 'uiSrc/components'
import styles from './styles.module.scss'

export const DEFAULT_REGIONS = ['us-east-2', 'asia-northeast1']
export const DEFAULT_PROVIDER = OAuthProvider.AWS

const getProviderRegions = (regions: Region[], provider: OAuthProvider) =>
  (find(regions, { provider }) || {}).regions || []

const OAuthSelectPlan = () => {
  const {
    isOpenDialog,
    plansInit,
    loading,
    setIsOpenSelectPlanDialog,
    setSocialDialogState,
  } = useOAuthStore(useShallow((state) => ({
    isOpenDialog: state.plan.isOpenDialog,
    plansInit: state.plan.data,
    loading: state.plan.loading,
    setIsOpenSelectPlanDialog: state.setIsOpenSelectPlanDialog,
    setSocialDialogState: state.setSocialDialogState,
  })))

  // get the regions from outside
  const rsRegions = [
    {
      provider: 'AWS',
      regions: ['us-east-2', 'ap-southeast-1', 'sa-east-1'],
    },
    {
      provider: 'GCP',
      regions: ['asia-northeast1', 'europe-west1', 'us-central1'],
    },
  ]

  const [plans, setPlans] = useState(plansInit || [])
  const [planIdSelected, setPlanIdSelected] = useState('')
  const [providerSelected, setProviderSelected] = useState<OAuthProvider>(DEFAULT_PROVIDER)
  const [rsProviderRegions, setRsProviderRegions] = useState(getProviderRegions(rsRegions, providerSelected))

  useEffect(() => {
    setRsProviderRegions(getProviderRegions(rsRegions, providerSelected))
  }, [providerSelected, plansInit])

  useEffect(() => {
    if (!plansInit.length) {
      return
    }

    const filteredPlans = filter(plansInit, { provider: providerSelected })
      .sort((a, b) => (a?.details?.displayOrder || 0) - (b?.details?.displayOrder || 0))

    const defaultPlan = filteredPlans.find(({ region = '' }) => DEFAULT_REGIONS.includes(region))
    const rsPreviewPlan = filteredPlans.find(({ region = '' }) => rsProviderRegions?.includes(region))
    const planId = (defaultPlan || rsPreviewPlan || first(filteredPlans) || {}).id?.toString() || ''

    setPlans(filteredPlans)
    setPlanIdSelected(planId)
  }, [plansInit, providerSelected, rsProviderRegions])

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED,
    })
    setPlanIdSelected('')
    setProviderSelected(DEFAULT_PROVIDER)
    setIsOpenSelectPlanDialog(false)
    setSocialDialogState(null)
  }, [])

  if (!isOpenDialog) return null

  const getOptionDisplay = (item: CloudSubscriptionPlanResponse) => {
    const { region = '', details: { countryName = '', cityName = '' }, provider } = item
    const rsProviderRegions: string[] = find(rsRegions, { provider })?.regions || []

    return (
      <div color="subdued" size="s" data-testid={`option-${region}`}>
        {`${countryName} (${cityName})`}
        <div className={styles.regionName}>{region}</div>
        {rsProviderRegions?.includes(region) && (
          <div className={styles.rspreview} data-testid={`rs-text-${region}`}>(Redis 7.2)</div>
        )}
      </div>
    )
  }

  const regionOptions: SuperSelectOption[] = plans.map(
    (item) => {
      const { id, region = '' } = item
      return {
        value: `${id}`,
        inputDisplay: getOptionDisplay(item),
        dropdownDisplay: getOptionDisplay(item),
        'data-test-subj': `oauth-region-${region}`,
      }
    },
  )

  const onChangeRegion = (region: string) => {
    setPlanIdSelected(region)
  }

  const handleSubmit = () => {
    createFreeDbJob({
      name: CloudJobName.CreateFreeSubscriptionAndDatabase,
      resources: { planId: toNumber(planIdSelected) },
      onSuccessAction: () => {
        setIsOpenSelectPlanDialog(false)
        showInfinityToast(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)?.Inner)
      },
    })
  }

  return (
    <Popup
      modal
      open={!!isOpenDialog}
      closeOnDocumentClick={false}
      className={styles.container}
      data-testid="oauth-select-plan-dialog"
    >
      <RiButton className="absolute top-4 right-4" onClick={handleOnClose} >
        <VscClose />
      </RiButton>
      <div className={styles.modalBody}>
        <section className={styles.content}>

          <h2>Choose a cloud vendor</h2>

        </section>
      </div>
    </Popup>
  )
}

export default OAuthSelectPlan

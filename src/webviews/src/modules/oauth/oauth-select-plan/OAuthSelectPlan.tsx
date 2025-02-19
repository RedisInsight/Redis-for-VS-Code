import { filter, find, first, toNumber } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { VscCheck, VscClose } from 'react-icons/vsc'
import Popup from 'reactjs-popup'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { CloudJobName, CloudJobStep, OAuthProvider, OAuthProviders } from 'uiSrc/constants'
import { createFreeDbJob, useOAuthStore } from 'uiSrc/store'
import { CloudSubscriptionPlanResponse, Region } from 'uiSrc/store/hooks/use-oauth/interface'
import { RiButton } from 'uiSrc/ui'
import { sendEventTelemetry, showInfinityToast, TelemetryEvent } from 'uiSrc/utils'

import { INFINITE_MESSAGES, SuperSelect, SuperSelectOption } from 'uiSrc/components'
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
      <div color="subdued"
        // size="s"
        data-testid={`option-${region}`}>
        {`${countryName} (${cityName})`}
        <div
        // className={styles.regionName}
        >{region}</div>
        {rsProviderRegions?.includes(region) && (
          <div
            // className={styles.rspreview}
            data-testid={`rs-text-${region}`}>(Redis 7.2)</div>
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
      data-testid="oauth-select-plan-dialog"
    >
      <RiButton className="absolute top-4 right-4" onClick={handleOnClose} >
        <VscClose />
      </RiButton>
      <div
      >
        <section className={styles.content}>

          <h2 className={styles.title}>{l10n.t('Choose a cloud vendor')}</h2>

          <div className={styles.subTitle}>
            {l10n.t(
              'Select a cloud vendor and region to complete the final step towards your free Redis database. No credit card is required.',
            )}
          </div>

          <section className={styles.providers}>
            {OAuthProviders.map(({ icon: Icon, id, label }) => (
              <div className={styles.provider} key={id}>
                {id === providerSelected
                  && <div className={cx(styles.providerActiveIcon)}>
                    <VSCodeButton appearance="icon">
                      <VscCheck />
                    </VSCodeButton>
                  </div>
                }

                <RiButton onClick={() => setProviderSelected(id)}
                  className={cx(styles.providerBtn,
                    { [styles.activeProvider]: id === providerSelected },
                    { [styles.awsIcon]: id === OAuthProvider.AWS },
                  )}>
                  <Icon />
                </RiButton>

                <div className={styles.providerLabel}>{label}</div>
              </div>
            ))}
          </section>

          <section>
            <div
            // className={styles.regionLabel}
            >{l10n.t('Region')}</div>
            <SuperSelect
              // fullWidth
              // itemClassName={styles.regionSelectItem}
              // className={styles.regionSelect}
              // disabled={loading || !regionOptions.length}
              isLoading={loading}
              options={regionOptions}
              // valueOfSelected={planIdSelected}
              // onChange={onChangeRegion}
              data-testid="select-oauth-region"
            />

            {!regionOptions.length && (
              <div
                // className={styles.selectDescription}
                data-testid="select-region-select-description">
                {l10n.t('No regions available, try another vendor.')}
              </div>
            )}
          </section>
          <footer className={styles.footer}>
            <VSCodeButton
              appearance="secondary"
              onClick={handleOnClose}
              className={styles.button}
              data-testid="close-oauth-select-plan-dialog"
              aria-labelledby="close oauth select plan dialog"
            >
              {l10n.t('Cancel')}
            </VSCodeButton>
            <VSCodeButton
              disabled={loading || !planIdSelected}
              onClick={handleSubmit}
              className={styles.button}
              data-testid="submit-oauth-select-plan-dialog"
              aria-labelledby="submit oauth select plan dialog"
            >
              {l10n.t('Create database')}
            </VSCodeButton>
          </footer>
        </section>
      </div>
    </Popup >
  )
}

export default OAuthSelectPlan

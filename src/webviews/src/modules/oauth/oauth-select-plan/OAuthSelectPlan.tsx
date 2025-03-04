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
import { RiButton, Select, SelectOption } from 'uiSrc/ui'
import { sendEventTelemetry, showInfinityToast, TelemetryEvent } from 'uiSrc/utils'

import { INFINITE_MESSAGES } from 'uiSrc/components'
import styles from './styles.module.scss'

interface PlanLabelData {
  id: number,
  region: string,
  countryName: string,
  cityName: string,
  provider: string,
}

const getProviderRegions = (regions: Region[], provider: OAuthProvider) =>
  (find(regions, { provider }) || {}).regions || []

const DEFAULT_REGIONS = ['us-east-2', 'asia-northeast1']
const DEFAULT_PROVIDER = OAuthProvider.AWS

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

  // TODO [DA]: Replace redis stack regions [] with the following lines, once feature flags are implemented
  // const { [FeatureFlags.cloudSso]: cloudSsoFeature = {} } = useSelector(appFeatureFlagsFeaturesSelector)
  // const rsRegions: Region[] = get(cloudSsoFeature, 'data.selectPlan.components.redisStackPreview', [])
  const rsRegions: Region[] = []

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

  const getPlanOptionLabel = (plan: PlanLabelData) => {
    const rsProviderRegions: string[] = find(rsRegions, { provider: plan.provider })?.regions || []
    return (
      <div data-testid={`option-${plan.region}`}>
        <span className="text-[11px]">{`${plan.countryName} (${plan.cityName})`}</span>
        <span className="text-[10px]"> {plan.region}</span>
        {rsProviderRegions?.includes(plan.region)
          && (<span className="text-[10px] ml-[10px]" data-testid={`rs-text-${plan.region}`}> (Redis 7.2)</span>)
        }
      </div>
    )
  }

  const regionOptions: SelectOption[] = plans.map(
    (item: CloudSubscriptionPlanResponse) => {
      const plan: PlanLabelData = {
        id: item.id,
        region: item.region ?? '',
        cityName: item.details.cityName ?? '',
        countryName: item.details.countryName ?? '',
        provider: item.provider,
      }

      return {
        value: `${plan.id}`,
        label: getPlanOptionLabel(plan),
        testid: `oauth-region-${plan.region}`,
      }
    },
  )

  const onChangeRegion = (region: string) => {
    setPlanIdSelected(region || '')
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
      className="oauth-select-plan-dialog"
      data-testid="oauth-select-plan-dialog"
    >
      <RiButton data-testid="close-icon-oauth-select-plan-dialog" className={styles.closeBtn} onClick={handleOnClose} >
        <VscClose />
      </RiButton>
      <section className={styles.content}>

        <h2 className={styles.title}>{l10n.t('Choose a cloud vendor')}</h2>

        <div className={styles.subTitle}>
          {l10n.t(
            'Select a cloud vendor and region to complete the final step towards your free Redis database.',
          )}
          &nbsp;
          {l10n.t(
            'No credit card is required.',
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

        <section className={styles.region}>
          <div>{l10n.t('Region')}</div>
          <Select
            disabled={loading || !regionOptions.length}
            idSelected={planIdSelected}
            onChange={onChangeRegion}
            options={regionOptions}
            containerClassName={styles.select}
            testid="select-oauth-region"
          />

          {!regionOptions.length && (
            <div className={styles.selectDescription}
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
    </Popup >
  )
}

export default OAuthSelectPlan

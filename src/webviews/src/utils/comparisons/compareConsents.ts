import { has } from 'lodash'
import { isVersionHigher } from 'uiSrc/utils/comparisons/compareVersions'

// There was an issue that caused users to have encryption setting populated as false by default
// This is a custom check to address that issue for existing users. The commit should be reverted after some time.
const shouldTriggerKeytarEncryptionSpec = (spec: any, applied: any): boolean => true
  // local settings are from v1.0.6
  && applied?.version === '1.0.6'
  // has locally stored false value
  && applied.encryption === false
  // keytar is enabled
  && spec?.encryption?.disabled === false
  // target current version of config
  && spec.encryption.since === '1.0.2'

// returns true if has different consents
export const isDifferentConsentsExists = (specs: any, applied: any) =>
  !!compareConsents(specs, applied).length

export const compareConsents = (
  specs: any = {},
  applied: any = {},
  isReturnAllNonRequired: boolean = false,
): any[] => {
  if (!specs) {
    return []
  }
  return Object.keys(specs)
    .filter(
      (consent) =>
        (isReturnAllNonRequired && !specs[consent]?.required)
        || applied === null
        || !has(applied, consent)
        || (consent === 'encryption' && shouldTriggerKeytarEncryptionSpec(specs, applied))
        || isVersionHigher(specs[consent]?.since, applied.version),
    )
    .map((consent) => ({ ...specs[consent], agreementName: consent }))
}

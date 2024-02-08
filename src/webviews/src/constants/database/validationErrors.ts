import * as l10n from '@vscode/l10n'

export const validationErrors = {
  REQUIRED_TITLE: (count: number) =>
    l10n.t('Enter a value for required fields ({0}):', count),
  NO_DBS_SELECTED: l10n.t('No databases selected.'),
  SELECT_AT_LEAST_ONE: (text: string) => l10n.t('Select at least one {0}', text),
  NO_PRIMARY_GROUPS_SENTINEL: l10n.t('No primary groups selected.'),
  NO_SUBSCRIPTIONS_CLOUD: l10n.t('No subscriptions selected.'),
}

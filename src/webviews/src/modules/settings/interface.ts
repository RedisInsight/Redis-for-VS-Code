export interface IConsent {
  defaultValue: boolean
  displayInSetting: boolean
  required: boolean
  editable: boolean
  disabled: boolean
  category?: string
  since: string
  title: string
  label: string
  agreementName: string
  description?: string
}

export enum ConsentCategories {
  Notifications = 'notifications',
  Privacy = 'privacy',
}

import * as l10n from '@vscode/l10n'

interface IFormField {
  id?: string
  name: string
  isRequire: boolean
  label: string
  placeholder: string
}

export interface IAddCommonFieldsFormConfig {
  keyName: IFormField
  keyTTL: IFormField
}

export const AddCommonFieldsFormConfig: IAddCommonFieldsFormConfig = {
  keyName: {
    name: 'keyName',
    isRequire: true,
    label: l10n.t('Key Name*'),
    placeholder: l10n.t('Enter Key Name'),
  },
  keyTTL: {
    name: 'keyTTL',
    isRequire: false,
    label: l10n.t('TTL'),
    placeholder: l10n.t('No limit'),
  },
}

interface IAddHashFormConfig {
  fieldName: IFormField
  fieldValue: IFormField
}

export const AddHashFormConfig: IAddHashFormConfig = {
  fieldName: {
    name: 'fieldName',
    isRequire: false,
    label: l10n.t('Field'),
    placeholder: l10n.t('Enter Field'),
  },
  fieldValue: {
    name: 'fieldValue',
    isRequire: false,
    label: l10n.t('Value'),
    placeholder: l10n.t('Enter Value'),
  },
}

interface IAddZsetFormConfig {
  score: IFormField
  member: IFormField
}

export const AddZsetFormConfig: IAddZsetFormConfig = {
  score: {
    name: 'score',
    isRequire: true,
    label: l10n.t('Score*'),
    placeholder: l10n.t('Enter Score*'),
  },
  member: {
    name: 'member',
    isRequire: false,
    label: l10n.t('Member'),
    placeholder: l10n.t('Enter Member'),
  },
}

interface IAddSetFormConfig {
  member: IFormField
}

export const AddSetFormConfig: IAddSetFormConfig = {
  member: {
    name: 'member',
    isRequire: false,
    label: l10n.t('Member'),
    placeholder: l10n.t('Enter Member'),
  },
}

interface IAddStringFormConfig {
  value: IFormField
}

export const AddStringFormConfig: IAddStringFormConfig = {
  value: {
    name: 'value',
    isRequire: false,
    label: l10n.t('Value'),
    placeholder: l10n.t('Enter Value'),
  },
}

interface IAddListFormConfig {
  element: IFormField
  count: IFormField
}

export const AddListFormConfig: IAddListFormConfig = {
  element: {
    name: 'element',
    isRequire: false,
    label: l10n.t('Element'),
    placeholder: l10n.t('Enter Element'),
  },
  count: {
    name: 'count',
    isRequire: true,
    label: l10n.t('Count'),
    placeholder: l10n.t('Enter Count'),
  },
}

interface IAddJSONFormConfig {
  value: IFormField
}

export const AddJSONFormConfig: IAddJSONFormConfig = {
  value: {
    name: 'value',
    isRequire: false,
    label: l10n.t('Value*'),
    placeholder: l10n.t('Enter JSON'),
  },
}

interface IAddStreamFormConfig {
  entryId: IFormField
  name: IFormField
  value: IFormField
}

export const AddStreamFormConfig: IAddStreamFormConfig = {
  entryId: {
    id: 'entryId',
    name: l10n.t('Entry ID'),
    isRequire: true,
    label: l10n.t('Entry ID*'),
    placeholder: l10n.t('Enter Entry ID'),
  },
  name: {
    id: 'name',
    name: l10n.t('Field Name'),
    isRequire: false,
    label: l10n.t('Field'),
    placeholder: l10n.t('Enter Field'),
  },
  value: {
    id: 'value',
    name: l10n.t('Field Value'),
    isRequire: false,
    label: l10n.t('Value'),
    placeholder: l10n.t('Enter Value'),
  },
}

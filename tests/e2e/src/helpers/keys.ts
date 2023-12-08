import { KeyTypesTexts } from './constants';

export const keyTypes = [
    { textType: KeyTypesTexts.Hash, keyName: 'hash', data: 'value' },
    { textType: KeyTypesTexts.List, keyName: 'list', data: 'element' },
    { textType: KeyTypesTexts.Set, keyName: 'set', data: 'member' },
    { textType: KeyTypesTexts.ZSet, keyName: 'zset', data: 'member' },
    { textType: KeyTypesTexts.String, keyName: 'string', data: 'value' },
    { textType: KeyTypesTexts.ReJSON, keyName: 'json', data: 'data' },
    { textType: KeyTypesTexts.Stream, keyName: 'stream', data: 'field' },
    { textType: KeyTypesTexts.Graph, keyName: 'graph' },
    { textType: KeyTypesTexts.TimeSeries, keyName: 'timeSeries' }
];

/**
 * String key parameters
 * @param keyName The name of the key
 * @param value The value in the string
 */
export type StringKeyParameters = {
  keyName: string;
  value: string;
};

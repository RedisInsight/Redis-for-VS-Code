import React from 'react'
import * as l10n from '@vscode/l10n'
import { EXTERNAL_LINKS } from 'uiSrc/constants'
import { Maybe, RedisString } from 'uiSrc/interfaces'
import { bufferToString, formatNameShort } from 'uiSrc/utils'
// import styles from './styles.module.scss'

// TODO: use i10n file for texts
export const successMessages = {
  ADDED_NEW_DATABASE: (databaseName: string) => ({
    title: l10n.t('Database has been added'),
    message: (
      <>
        <b>{formatNameShort(databaseName)}</b>
        {l10n.t(' has been added to RedisInsight.')}
      </>
    ),
  }),
  EDITED_NEW_DATABASE: (databaseName: string) => ({
    title: l10n.t('Database has been edited'),
    message: (
      <>
        <b>{formatNameShort(databaseName)}</b>
        {l10n.t(' has been edited to RedisInsight.')}
      </>
    ),
  }),
  DELETE_DATABASE: (databaseName: string) => ({
    title: l10n.t('Database has been deleted'),
    message: (
      <>
        <b>{formatNameShort(databaseName)}</b>
        {l10n.t(' has been deleted to RedisInsight.')}
      </>
    ),
  }),
  DELETE_DATABASES: (databaseNames: Maybe<string>[]) => {
    const limitShowRemovedDatabases = 10
    return {
      title: l10n.t('Databases have been deleted'),
      message: (
        <>
          <span>
            <b>{databaseNames.length}</b>
            {l10n.t(' databases have been deleted from RedisInsight:')}
          </span>
          <ul style={{ marginBottom: 0 }}>
            {databaseNames.slice(0, limitShowRemovedDatabases).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={i}>
                {formatNameShort(el)}
              </li>
            ))}
            {databaseNames.length >= limitShowRemovedDatabases && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  ADDED_NEW_KEY: (keyName: RedisString) => ({
    title: l10n.t('Key has been added'),
    message: (
      <>
        <b>{formatNameShort(bufferToString(keyName))}</b>
        {l10n.t(' has been added.')}
      </>
    ),
  }),
  DELETED_KEY: (keyName: RedisString) => ({
    title: l10n.t('{0} has been deleted.', formatNameShort(bufferToString(keyName))),
    message: (
      <>
        <b>{formatNameShort(bufferToString(keyName))}</b>
        {l10n.t(' has been deleted.')}
      </>
    ),
  }),
  REMOVED_KEY_VALUE: (keyName: RedisString, keyValue: RedisString, valueType: string) => ({
    title: l10n.t('{0} has been removed', valueType),
    message: l10n.t(
      '{0} has been removed from {1}',
      formatNameShort(bufferToString(keyValue)),
      formatNameShort(bufferToString(keyName)),
    ),
  }),
  REMOVED_LIST_ELEMENTS: (
    keyName: RedisString,
    numberOfElements: number,
    listOfElements: RedisString[],
  ) => {
    const limitShowRemovedElements = 10
    return {
      title: l10n.t('Elements have been removed'),
      message: (
        <>
          <span>
            {l10n.t('{0} Element(s) removed from {1}:', numberOfElements, formatNameShort(bufferToString(keyName)))}
          </span>
          <ul style={{ marginBottom: 0 }}>
            {listOfElements.slice(0, limitShowRemovedElements).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={i}>
                {formatNameShort(bufferToString(el))}
              </li>
            ))}
            {listOfElements.length >= limitShowRemovedElements && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  INSTALLED_NEW_UPDATE: (updateDownloadedVersion: string, onClickLink?: () => void) => ({
    title: l10n.t('Application updated'),
    message: (
      <>
        <span>{l10n.t('Your application has been updated to {0}. Find more information in ', updateDownloadedVersion)}</span>
        <a href={EXTERNAL_LINKS.releaseNotes} onClick={() => onClickLink?.()} className="link-underline" target="_blank" rel="noreferrer">{l10n.t('Release Notes.')}</a>
      </>
    ),
    group: 'upgrade',
  }),
  // only one message is being processed at the moment
  MESSAGE_ACTION: (message: string, actionName: string) => ({
    title: (
      <>
        {l10n.t('Message has been {0}', actionName)}
      </>
    ),
    message: (
      <>
        <b>{message}</b>
        {' '}
        has been successfully
        {' '}
        {actionName}.
      </>
    ),
  }),
  NO_CLAIMED_MESSAGES: () => ({
    title: l10n.t('No messages claimed'),
    message: l10n.t('No messages exceed the minimum idle time.'),
  }),
  CREATE_INDEX: () => ({
    title: l10n.t('Index has been created'),
    message: l10n.t('Open the list of indexes to see it.'),
  }),
  TEST_CONNECTION: () => ({
    title: l10n.t('Connection is successful'),
  }),
  DELETE_LIBRARY: (libraryName: string) => ({
    title: l10n.t('Library has been deleted'),
    message: (
      <>
        <b>{formatNameShort(libraryName)}</b>
        {l10n.t(' has been deleted.')}
      </>
    ),
  }),
  ADD_LIBRARY: (libraryName: string) => ({
    title: l10n.t('Library has been added'),
    message: (
      <>
        <b>{formatNameShort(libraryName)}</b>
        {l10n.t(' has been added.')}
      </>
    ),
  }),
  REMOVED_ALL_CAPI_KEYS: () => ({
    title: l10n.t('API keys have been removed'),
    message: l10n.t('All API keys have been removed from RedisInsight.'),
  }),
  REMOVED_CAPI_KEY: (name: string) => ({
    title: l10n.t('API Key has been removed'),
    message: l10n.t('{0} has been removed from RedisInsight.', formatNameShort(name)),
  }),
  DATABASE_ALREADY_EXISTS: () => ({
    title: l10n.t('Database already exists'),
    message: l10n.t('No new database connections have been added.'),
  }),
}

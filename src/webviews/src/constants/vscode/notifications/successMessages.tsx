import React from 'react'
import * as l10n from '@vscode/l10n'
import { EXTERNAL_LINKS } from 'uiSrc/constants'
import { Maybe, RedisString } from 'uiSrc/interfaces'
import { bufferToString, formatNameShort } from 'uiSrc/utils'
// import styles from './styles.module.scss'

// TODO: use i10n file for texts
export const successMessages = {
  ADDED_NEW_DATABASE: (databaseName: string) => ({
    title: 'Database has been added',
    message: (
      <>
        <b>{formatNameShort(databaseName)}</b>
        {l10n.t(' has been added to RedisInsight.')}
      </>
    ),
  }),
  DELETE_DATABASE: (databaseName: string) => ({
    title: 'Database has been deleted',
    message: (
      <>
        <b>{formatNameShort(databaseName)}</b>
        {l10n.t(' has been added to RedisInsight.')}
      </>
    ),
  }),
  DELETE_DATABASES: (databaseNames: Maybe<string>[]) => {
    const limitShowRemovedDatabases = 10
    return {
      title: 'Databases have been deleted',
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
    title: 'Key has been added',
    message: (
      <>
        <b>{formatNameShort(bufferToString(keyName))}</b>
        {' '}
        has been added.
      </>
    ),
  }),
  DELETED_KEY: (keyName: RedisString) => ({
    title: `${formatNameShort(bufferToString(keyName))} has been deleted.`,
    message: (
      <>
        <b>{formatNameShort(bufferToString(keyName))}</b>
        {' '}
        has been deleted.
      </>
    ),
  }),
  REMOVED_KEY_VALUE: (keyName: RedisString, keyValue: RedisString, valueType: string) => ({
    title: `${valueType} has been removed`,
    message: `${formatNameShort(bufferToString(keyValue))} has been removed from ${formatNameShort(bufferToString(keyName))}`,
  }),
  REMOVED_LIST_ELEMENTS: (
    keyName: RedisString,
    numberOfElements: number,
    listOfElements: RedisString[],
  ) => {
    const limitShowRemovedElements = 10
    return {
      title: 'Elements have been removed',
      message: (
        <>
          <span>
            {`${numberOfElements} Element(s) removed from ${formatNameShort(bufferToString(keyName))}:`}
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
    title: 'Application updated',
    message: (
      <>
        <span>{`Your application has been updated to ${updateDownloadedVersion}. Find more information in `}</span>
        <a href={EXTERNAL_LINKS.releaseNotes} onClick={() => onClickLink?.()} className="link-underline" target="_blank" rel="noreferrer">Release Notes.</a>
      </>
    ),
    group: 'upgrade',
  }),
  // only one message is being processed at the moment
  MESSAGE_ACTION: (message: string, actionName: string) => ({
    title: (
      <>
        Message has been
        {' '}
        {actionName}
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
    title: 'No messages claimed',
    message: 'No messages exceed the minimum idle time.',
  }),
  CREATE_INDEX: () => ({
    title: 'Index has been created',
    message: 'Open the list of indexes to see it.',
  }),
  TEST_CONNECTION: () => ({
    title: 'Connection is successful',
  }),
  DELETE_LIBRARY: (libraryName: string) => ({
    title: 'Library has been deleted',
    message: (
      <>
        <b>{formatNameShort(libraryName)}</b>
        {' '}
        has been deleted.
      </>
    ),
  }),
  ADD_LIBRARY: (libraryName: string) => ({
    title: 'Library has been added',
    message: (
      <>
        <b>{formatNameShort(libraryName)}</b>
        {' '}
        has been added.
      </>
    ),
  }),
  REMOVED_ALL_CAPI_KEYS: () => ({
    title: 'API keys have been removed',
    message: 'All API keys have been removed from RedisInsight.',
  }),
  REMOVED_CAPI_KEY: (name: string) => ({
    title: 'API Key has been removed',
    message: `${formatNameShort(name)} has been removed from RedisInsight.`,
  }),
  DATABASE_ALREADY_EXISTS: () => ({
    title: 'Database already exists',
    message: 'No new database connections have been added.',
  }),
}

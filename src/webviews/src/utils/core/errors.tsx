import React from 'react'
import { pickBy, identity, set, isString, isEmpty } from 'lodash'
import { AxiosError } from 'axios'
import { CustomErrorCodes, DEFAULT_ERROR_MESSAGE, EXTERNAL_LINKS, UTM_CAMPAINGS, UTM_MEDIUMS, validationErrors } from 'uiSrc/constants'
import { CustomError } from 'uiSrc/interfaces'
import { Spacer } from 'uiSrc/ui'
import { getUtmExternalLink } from './links'

const maxErrorsCount = 5

export const getRequiredFieldsText = (errorsInit: { [key: string]: any }) => {
  const errors = pickBy(errorsInit, identity)

  const errorsArr = Object.values(errors).map((err) => [
    err,
    <br key={err as string} />,
  ])

  if (errorsArr.length === 0) {
    return null
  }

  if (errorsArr.length > maxErrorsCount) {
    errorsArr.splice(maxErrorsCount, errorsArr.length, ['...'])
  }

  return (
    <div>
      {validationErrors.REQUIRED_TITLE(Object.keys(errors).length)}
      <br />
      {errorsArr}
    </div>
  )
}

export const parseCustomError = (err: CustomError | string = DEFAULT_ERROR_MESSAGE): AxiosError => {
  const error = {
    response: {
      status: 500,
      data: { },
    },
  }

  if (isString(err)) {
    return set(error, 'response.data.message', err) as AxiosError
  }

  let title: string = 'Error'
  let message: React.ReactElement | string = ''
  const additionalInfo: Record<string, any> = {}

  switch (err?.errorCode) {
    case CustomErrorCodes.CloudOauthGithubEmailPermission:
      title = 'Github Email Permission'
      message = (
        <>
          Unable to get an email from the GitHub account. Make sure that it is available.
          <br />
        </>
      )
      break
    case CustomErrorCodes.CloudOauthMisconfiguration:
      title = 'Misconfiguration'
      message = (
        <>
          Authorization server encountered a misconfiguration error and was unable to complete your request.
          <Spacer size="xs" />
          Try again later.
          <Spacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnknownAuthorizationRequest:
      title = 'Error'
      message = (
        <>
          Unknown authorization request.
          <Spacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnexpectedError:
      title = 'Error'
      message = (
        <>
          An unexpected error occurred.
          <Spacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthSsoUnsupportedEmail:
      title = 'Invalid email'
      message = (
        <>
          Invalid email.
        </>
      )
      break
    case CustomErrorCodes.CloudApiBadRequest:
      title = 'Bad request'
      message = (
        <>
          Your request resulted in an error.
          <Spacer size="xs" />
          Try again later.
          <Spacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiForbidden:
      title = 'Access denied'
      message = (
        <>
          You do not have permission to access Redis Cloud.
        </>
      )
      break

    case CustomErrorCodes.CloudApiInternalServerError:
      title = 'Server error'
      message = (
        <>
          Try restarting Redis Insight.
          <Spacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiNotFound:
      title = 'Resource was not found'
      message = (
        <>
          Resource requested could not be found.
          <Spacer size="xs" />
          Try again later.
          <Spacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudCapiUnauthorized:
    case CustomErrorCodes.CloudApiUnauthorized:
    case CustomErrorCodes.QueryAiUnauthorized:
      title = 'Session expired'
      message = (
        <>
          Sign in again to continue working with Redis Cloud.
          <Spacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudCapiKeyUnauthorized:
      title = 'Invalid API key'
      message = (
        <>
          Your Redis Cloud authorization failed.
          <Spacer size="xs" />
          Remove the invalid API key from Redis Insight and try again.
          <Spacer size="s" />
          Open the Settings page to manage Redis Cloud API keys.
        </>
      )
      additionalInfo.resourceId = err.resourceId
      additionalInfo.errorCode = err.errorCode
      break

    case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
      title = 'Database already exists'
      message = (
        <>
          You already have a free trial Redis Cloud database running.
          <Spacer size="s" />
          Check out your
          <a
            href={getUtmExternalLink(
              EXTERNAL_LINKS.cloudConsole,
              { campaign: UTM_CAMPAINGS.Main, medium: UTM_MEDIUMS.Main },
            )}
            target="_blank"
            rel="noreferrer"
          >
            {' Cloud console '}
          </a>
          for connection details.
        </>
      )
      break

    default:
      title = 'Error'
      message = err?.message || DEFAULT_ERROR_MESSAGE
      break
  }

  const parsedError: any = { title, message }

  if (!isEmpty(additionalInfo)) {
    parsedError.additionalInfo = additionalInfo
  }

  return set(error, 'response.data', parsedError) as AxiosError
}

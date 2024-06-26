import React from 'react'
import { pickBy, identity } from 'lodash'
import { validationErrors } from 'uiSrc/constants'

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

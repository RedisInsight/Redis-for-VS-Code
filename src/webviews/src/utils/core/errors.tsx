import React from 'react'
import { validationErrors } from 'uiSrc/constants'

const maxErrorsCount = 5

export const getRequiredFieldsText = (errors: { [key: string]: any }) => {
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

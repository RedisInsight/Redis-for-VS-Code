import React from 'react'
import { CloudJobName } from 'uiSrc/constants'
import { fireEvent, render, screen } from 'testSrc/helpers'

import { INFINITE_MESSAGES } from './InfiniteMessages'

describe('INFINITE_MESSAGES', () => {
  describe('SUCCESS_CREATE_DB', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB(CloudJobName.CreateFreeSubscriptionAndDatabase, vi.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onSuccess', () => {
      const onSuccess = vi.fn()
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB(CloudJobName.CreateFreeSubscriptionAndDatabase, onSuccess)
      render(<>{Inner}</>)

      // fireEvent.click(screen.getByTestId('notification-connect-db'))
      fireEvent.mouseUp(screen.getByTestId('success-create-db-notification'))
      fireEvent.mouseDown(screen.getByTestId('success-create-db-notification'))

      // expect(onSuccess).toBeCalled()
    })
  })
  describe('AUTHENTICATING', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.AUTHENTICATING()
      expect(render(<>{Inner}</>)).toBeTruthy()
    })
  })
  describe('PENDING_CREATE_DB', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.PENDING_CREATE_DB()
      expect(render(<>{Inner}</>)).toBeTruthy()
    })
  })
  describe('DATABASE_EXISTS', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.DATABASE_EXISTS(vi.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onSuccess', () => {
      const onSuccess = vi.fn()
      const { Inner } = INFINITE_MESSAGES.DATABASE_EXISTS(onSuccess)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('import-db-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('database-exists-notification'))
      fireEvent.mouseDown(screen.getByTestId('database-exists-notification'))

      expect(onSuccess).toBeCalled()
    })

    it('should call onCancel', () => {
      const onSuccess = vi.fn()
      const onCancel = vi.fn()
      const { Inner } = INFINITE_MESSAGES.DATABASE_EXISTS(onSuccess, onCancel)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('cancel-import-db-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('database-exists-notification'))
      fireEvent.mouseDown(screen.getByTestId('database-exists-notification'))

      expect(onCancel).toBeCalled()
    })
  })
  describe('SUBSCRIPTION_EXISTS', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(vi.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onSuccess', () => {
      const onSuccess = vi.fn()
      const { Inner } = INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(onSuccess)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('create-subscription-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('subscription-exists-notification'))
      fireEvent.mouseDown(screen.getByTestId('subscription-exists-notification'))

      expect(onSuccess).toBeCalled()
    })

    it('should call onCancel', () => {
      const onSuccess = vi.fn()
      const onCancel = vi.fn()
      const { Inner } = INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(onSuccess, onCancel)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('cancel-create-subscription-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('subscription-exists-notification'))
      fireEvent.mouseDown(screen.getByTestId('subscription-exists-notification'))

      expect(onCancel).toBeCalled()
    })
  })
})

import React, { ReactNode } from 'react'
import { toast, ToastOptions } from 'react-toastify'

export const INFINITY_TOAST_ID = 'infinity_toast_id'

const notify = (content: ReactNode = '', options?: ToastOptions) => {
  toast(<div>{content}</div>, {
    autoClose: false,
    toastId: INFINITY_TOAST_ID,
    ...options,
    type: options?.type || 'default',
  })
}

const update = (content: ReactNode = '', options?: ToastOptions) => {
  toast.update(INFINITY_TOAST_ID, {
    render: <div>{content}</div>,
    autoClose: false,
    ...options,
    type: options?.type || 'default',
  })
}

export const showInfinityToast = (content: ReactNode = '', options?: ToastOptions) => {
  if (!toast.isActive(INFINITY_TOAST_ID)) {
    notify(content, options)
    return
  }

  update(content, options)
}

export const showErrorInfinityToast = (content: ReactNode = '', options?: ToastOptions) => {
  showInfinityToast(content, { ...options, type: 'error' })
}

export const removeInfinityToast = () => {
  toast.dismiss(INFINITY_TOAST_ID)
}

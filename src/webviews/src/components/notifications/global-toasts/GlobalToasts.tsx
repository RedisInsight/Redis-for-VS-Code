import React, { FC } from 'react'
import { Flip, ToastContainer } from 'react-toastify'
import styles from './styles.module.scss'

export const GlobalToasts: FC = () => (
  <ToastContainer
    transition={Flip}
    position="bottom-right"
    toastClassName={styles.toastsContainer}
  />
)

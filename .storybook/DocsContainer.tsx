import React, { PropsWithChildren } from 'react'
import { DocsContainer as BaseContainer, DocsContainerProps as BaseContainerProps } from '@storybook/blocks'
import { themes } from '@storybook/theming'
import { useDarkMode } from 'storybook-dark-mode'

export const DocsContainer = (
  { context, children }: PropsWithChildren<BaseContainerProps>,
) => {
  const dark = useDarkMode()
  return (
    <BaseContainer
      context={context}
      theme={dark ? themes.dark : themes.light}
    >
      {children}
    </BaseContainer>
  )
}

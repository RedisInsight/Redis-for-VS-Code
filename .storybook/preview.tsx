/** @type { import('@storybook/react').Preview } */
import React from 'react'
import { Provider } from 'react-redux'
import { Decorator, Preview } from '@storybook/react'
import { DocsContainer } from '@storybook/addon-docs'
import { themes } from '@storybook/theming'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { initialize, mswLoader, mswDecorator } from 'msw-storybook-addon'

import { mswHandlers } from './helpers'

import { store } from '../src/webviews/src/store'
import '../src/webviews/vscode.css'

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize({ quiet: true }, [...mswHandlers])

export const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    darkMode: {
      dark: { ...themes.dark },
      light: { ...themes.light },
      stylePreview: true,
      darkClass: 'dark',
    },
    docs: {
      container: DocsContainer,
    },
  },
  loaders: [mswLoader],
}

export const decorators: Decorator[] = [
  mswDecorator,
  (Story) => (
    <Provider store={store}>
      <Story />
    </Provider>
  ),
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'dark',
    attributeName: 'data-mode',
  }),
]

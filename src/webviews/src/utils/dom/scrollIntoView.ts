import { Nullable } from 'uiSrc/interfaces'

const isScrollBehaviorSupported = (): boolean =>
  'scrollBehavior' in globalThis.document.documentElement.style

export const scrollIntoView = (el: Nullable<HTMLDivElement>, opts?: ScrollIntoViewOptions) => {
  if (el && el?.scrollIntoView && isScrollBehaviorSupported()) {
    el?.scrollIntoView(opts)
  } else if (el?.scrollIntoView) {
    el?.scrollIntoView(true)
  }
}

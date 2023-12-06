import { FormEventHandler } from 'react'

export type VSCodeToolkitEvent = ((e: Event) => unknown) & FormEventHandler<HTMLElement>

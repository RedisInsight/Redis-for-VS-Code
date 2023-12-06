import { StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type CommonMeddlewares = <T>(
  f: StateCreator<T, [], [['zustand/persist', T]]>,
  name?: string,
) => StateCreator<T, [], [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', T]]>

export const commonMiddlewares: CommonMeddlewares = (f) =>
  immer(devtools(f))

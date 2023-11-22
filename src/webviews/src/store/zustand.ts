import { StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type CommonMeddlewares = <T>(
  f: StateCreator<T, [], []>,
  name?: string,
) => StateCreator<T, [], [['zustand/immer', never], ['zustand/devtools', never]]>

export const commonMiddlewares: CommonMeddlewares = (f) =>
  immer(devtools(f))

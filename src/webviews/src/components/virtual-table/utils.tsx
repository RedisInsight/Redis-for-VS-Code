import React from 'react'

export const StopPropagation = ({ children }: { children: JSX.Element }) => (
  <div
    className="h-full w-full relative"
    onClick={(e) => e.stopPropagation()}
    role="presentation"
  >
    {children}
  </div>
)

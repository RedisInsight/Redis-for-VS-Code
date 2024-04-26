declare namespace JSX {
  interface IntrinsicElements {
    'vscode-dropdown': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement> & {
      position?: 'below' | 'above'
      class?: string
    }, HTMLDivElement>
    'vscode-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement> & {
      disabled?: boolean
      selected?: boolean
      value?: string
      class?: string
    }, HTMLDivElement>
  }
}

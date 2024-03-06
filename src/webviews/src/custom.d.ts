declare namespace JSX {
  interface IntrinsicElements {
    'vscode-dropdown': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement> & {
      position?: 'below' | 'above'
      class?: string
    }, HTMLDivElement>
  }
}

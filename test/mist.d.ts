interface Mist_button extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  'data-variant'?: 'primary' | 'secondary'
}

declare namespace JSX {
  interface IntrinsicElements {
    button: Mist_button
  }
}
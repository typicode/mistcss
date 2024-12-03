type ReactHTMLProps<
  Tag extends keyof React.ReactHTML
> = React.ReactHTML[Tag] extends React.DetailedHTMLFactory<infer Attributes, infer Element>
  ? React.DetailedHTMLProps<Attributes, Element>
  : React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>

interface Mist_button extends ReactHTMLProps<'button'> {
  'data-variant'?: 'primary' | 'secondary'
  style?: { '--highlightColor'?: string } & React.CSSProperties
}

interface Mist_div extends ReactHTMLProps<'div'> {
  'data-component'?: never
}

interface Mist_div_data_component_card extends ReactHTMLProps<'div'> {
  'data-component': 'card'
  'data-size'?: 'sm' | 'xl'
}

interface Mist_div_data_component_card_title extends ReactHTMLProps<'div'> {
  'data-component': 'card-title'
}

declare namespace JSX {
  interface IntrinsicElements {
    button: Mist_button
    div: Mist_div | Mist_div_data_component_card | Mist_div_data_component_card_title
  }
}

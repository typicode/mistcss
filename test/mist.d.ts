interface Mist_button extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  'data-variant'?: 'primary' | 'secondary'
  style?: { '--highlightColor'?: string } & React.CSSProperties
}

interface Mist_div extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  'data-component'?: never
}

interface Mist_div_data_component_card extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  'data-component': 'card'
  'data-size'?: 'sm' | 'xl'
}

interface Mist_div_data_component_card_title extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  'data-component': 'card-title'
}

declare namespace JSX {
  interface IntrinsicElements {
    button: Mist_button
    div: Mist_div | Mist_div_data_component_card | Mist_div_data_component_card_title
  }
}

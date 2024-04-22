import {
  attributeToCamelCase,
  propertyToCamelCase,
} from '../case.js'
import { Data } from '../parser.js'
import { hasChildren, renderPropsInterface } from './_common.js'

function renderTagAttributes(data: Data, indent: string): string {
  return [
    ...Object.keys(data.attributes).map(
      (attribute) => `${attribute}={${attributeToCamelCase(attribute)}}`,
    ),
    ...Array.from(data.booleanAttributes).map(
      (attribute) => `${attribute}={${attributeToCamelCase(attribute)}}`,
    ),
  ]
    .map((l) => indent + l)
    .join('\n')
}

function renderTagStyle(data: Data, indent: string): string {
  const foo = Array.from(data.properties)
    .map((property) => `'${property}': ${propertyToCamelCase(property)}`)
    .join(', ')

  return indent + `style={{ ${foo} }}`
}

function renderHTML(data: Data): string {
  return `<${data.tag}
  {...rest}
${renderTagAttributes(data, '  ')}
${renderTagStyle(data, '  ')}
  class="${data.className}"
${ hasChildren(data.tag) ? `>\n  <slot />\n</${data.tag}>` : '/>' }`
}

function renderProps(data: Data): string {
  const props = [
    ...Object.keys(data.attributes).map(attributeToCamelCase),
    ...Array.from(data.booleanAttributes).map(attributeToCamelCase),
    ...Array.from(data.properties).map(propertyToCamelCase),
    '...rest',
  ]
  return [
    'const { ',
    props.join(', '),
    ' } = Astro.props'
  ].join('')
}

export function render(filename: string, data: Data): string {
  return `---
// Generated by MistCSS, do not modify
import './${filename}.mist.css'

${renderPropsInterface(data)}

${renderProps(data)}
---

${renderHTML(data)}
`
}

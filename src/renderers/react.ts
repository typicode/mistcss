import {
  attributeToCamelCase,
  pascalCase,
  propertyToCamelCase,
} from './_case.js'
import { Data } from '../parser.js'
import { hasChildren, renderPropsInterface, renderTag } from './_common.js'

function renderImports(data: Data, isHono: boolean): string {
  if (hasChildren(data.tag)) {
    if (isHono) {
      return "import type { PropsWithChildren } from 'hono/jsx'"
    } else {
      return "import type { JSX, PropsWithChildren } from 'react'"
    }
  } else {
    if (isHono) {
      return ''
    } else {
      return "import type { JSX } from 'react'"
    }
  }
}

function renderFunction(data: Data, isClass: boolean): string {
  const args = [
    ...(hasChildren(data.tag) ? ['children'] : []),
    ...Object.keys(data.attributes).map(attributeToCamelCase),
    ...Array.from(data.booleanAttributes).map(attributeToCamelCase),
    ...Array.from(data.properties).map(propertyToCamelCase),
    '...props',
  ].join(', ')

  return `/**
* ${data.comment}
*/
export function ${pascalCase(data.className)}({ ${args} }: ${hasChildren(data.tag) ? `PropsWithChildren<Props>` : `Props`}) {
  return (${renderTag(data, '{children}', isClass ? 'class' : 'className')})
}`
}

export function render(name: string, data: Data, isHono = false): string {
  return `// Generated by MistCSS, do not modify
import './${name}.mist.css'

${renderImports(data, isHono)}

${renderPropsInterface(data, `JSX.IntrinsicElements['${data.tag}']`)}

${renderFunction(data, isHono)}
`
}

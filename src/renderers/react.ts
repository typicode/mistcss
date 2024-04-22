import {
  attributeToCamelCase,
  pascalCase,
  propertyToCamelCase,
} from '../case.js'
import { Data } from '../parser.js'
import { canTagHaveChildren } from '../utils.js'

// [ data-foo: ['one', 'two'] ]-> [ 'foo?: \'one\' | \'two\'' ]
function renderEnumTypes(attributes: Data['attributes']): string[] {
  return Object.entries(attributes).map(
    ([attribute, set]) =>
      `${attributeToCamelCase(attribute)}?: ${Array.from(set)
        .map((v) => `'${v}'`)
        .join(' | ')}`,
  )
}

// [ data-foo ] -> [ 'foo?: boolean' ]
function renderBooleanTypes(
  booleanAttributes: Data['booleanAttributes'],
): string[] {
  return Array.from(booleanAttributes).map(
    (attribute) => `${attributeToCamelCase(attribute)}?: boolean`,
  )
}

// [ --foo: green ] -> foo?: string
function renderStringTypes(properties: Data['properties']): string[] {
  return Array.from(properties).map(
    (property) => `${propertyToCamelCase(property)}?: string`,
  )
}

function renderPropType(data: Data): string {
  const props = [
    ...renderEnumTypes(data.attributes),
    ...renderBooleanTypes(data.booleanAttributes),
    ...renderStringTypes(data.properties),
  ]
    .map((l) => `  ${l}`)
    .join('\n')
  return `type Props = {
${props}
} & JSX.IntrinsicElements['${data.tag}']`
}

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

function renderFunctionArgs(data: Data, children?: boolean): string {
  const args = children ? ['children'] : [];
  return [
    ...args
    ...Object.keys(data.attributes).map(attributeToCamelCase),
    ...Array.from(data.booleanAttributes).map(attributeToCamelCase),
    ...Array.from(data.properties).map(propertyToCamelCase),
    '...props',
  ].join(', ')
}

type RenderFunctionOptionsType = {
  hono?: boolean;
  children?: boolean;
}

function renderFunction(data: Data, {
  hono,
  children
}: RenderFunctionOptionsType): string {
  return `export function ${pascalCase(data.className)}({ ${renderFunctionArgs(data, children)} }: ${children ? `PropsWithChildren<Props>` : `Props`}) {
  return (
    <${data.tag}
      {...props}
${renderTagAttributes(data, '      ')}
${renderTagStyle(data, '      ')}
      ${hono ? 'class' : 'className'}="${data.className}"
    ${children ? `>
      {children}
    </${data.tag}` : `/`}>
  )
}`
}

function renderImports({ hono, children }): string => {
  if (hono && children)
    return "import type { PropsWithChildren } from 'hono/jsx'";
  if (!hono && children)
    return "import type { JSX, PropsWithChildren } from 'react'";
  if (!hono && !children)
    return "import type { JSX } from 'react'";
  return '';
}

export function render(filename: string, data: Data, hono?: boolean): string {

  const children = canTagHaveChildren(data.tag);
  
  return `// Generated by MistCSS, do not modify
import './${filename}.mist.css'

${renderImports({ hono, children })}

${renderPropType(data)}

${renderFunction(data, {
  hono,
  children
})}
`
}

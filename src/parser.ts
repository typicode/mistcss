import {
  compile,
  DECLARATION,
  Element,
  Middleware,
  middleware,
  RULESET,
  serialize,
} from 'stylis'

export interface Data {
  className: string // foo
  tag: string // div
  attributes: Record<string, Set<string>> // data-foo: ['bar', 'baz']
  booleanAttributes: Set<string> // data-foo, data-bar
  properties: Set<string> // --foo, --bar
}

// (div.foo) -> { tag: 'div', className: 'foo' }
function parseScopeSelector(str: string): { tag: string; className: string } {
  const [tag = '', className = ''] = str.slice(1, -1).split('.')
  return { tag, className }
}

// :scope[data-foo="bar"] -> true
// :scope[data-foo] -> true
export function isAttribute(str: string): boolean {
  return str.startsWith(':scope[data-')
}

// :scope[data-foo="bar"] -> { attribute: 'data-foo',  value: 'bar' }
// :scope[data-foo] -> { attribute: 'data-foo',  value: '' }
function parseAttribute(str: string): { attribute: string; value?: string } {
  const [attribute = '', value] = str.slice(7, -1).split('=')
  return { attribute, value: value?.slice(1, -1) }
}

function update(data: Data): Middleware {
  return function (element, _index, _children, callback) {
    switch (element.type) {
      case DECLARATION:
        // Custom properties
        if ((element.props as string).startsWith('--')) {
          data.properties.add(element.props as string)
        }
        break

      case RULESET:
        ;(element.props as string[])
          .filter(isAttribute)
          .map(parseAttribute)
          .forEach(({ attribute, value }) => {
            if (value === undefined) {
              data.booleanAttributes.add(attribute)
            } else {
              const set = (data.attributes[attribute] ??= new Set())
              set.add(value)
            }
          })
        break
    }

    Array.isArray(element.children) && serialize(element.children, callback)
  }
}

export function parse(css: string): Data[] {
  const parsed: Data[] = []

  serialize(
    compile(css),
    middleware([
      (element) => {
        // Seach for @scope
        switch (element.type) {
          case '@scope': {
            const prop = element.props[0] // (.foo)
            if (prop === undefined) return // Not supported
            const { tag, className } = parseScopeSelector(prop)

            const data: Data = {
              tag,
              className,
              attributes: {},
              booleanAttributes: new Set<string>(),
              properties: new Set<string>(),
            }
            parsed.push(data)

            // Extract data-attributes and custom properties
            serialize(
              // Loop through @scope children
              // Note: nested rules are children of @scope, not :scope
              element.children as Element[],
              middleware([update(data)]),
            )
          }
        }
      },
    ]),
  )

  return parsed
}

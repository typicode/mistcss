function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1]?.toUpperCase() ?? '')
}

// foo-bar -> FooBar
export function pascalCase(str: string): string {
  return str.replace(/(?:^|-)([a-z])/g, (_, g: string) => g.toUpperCase())
}

// data-foo-bar -> fooBar
export function attributeToCamelCase(str: string): string {
  return camelCase(str.slice(5))
}

// data-foo-bar -> fooBar
export function propertyToCamelCase(str: string): string {
  return camelCase(str.slice(2))
}

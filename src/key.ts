import selectorParser = require('postcss-selector-parser');

// Turn button[data-component='foo'] into a key that will be used for the interface name
function key(selector: selectorParser.Node): string {
  let key = ''
  if (selector.type === 'tag') {
    key += selector.toString().toLowerCase()
  }
  const next = selector.next()
  if (next?.type === 'attribute') {
    const { attribute, value } = next as selectorParser.Attribute
    key += `_${attribute}`
    if (value) key += `_${value}`
  }
  return key.replace(/[^a-zA-Z0-9_]/g, '_')
}

module.exports = key

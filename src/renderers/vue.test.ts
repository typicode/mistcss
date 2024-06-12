import { expect, it, describe } from 'vitest'

import { Data } from '../parser.js'
import { render } from './vue.js'

describe('render', () => {
  it('renders Vue component (full)', () => {
    const data: Data = {
      comment: 'comment',
      tag: 'div',
      className: 'foo',
      attributes: {
        'data-attr': new Set(['a', 'b']),
        'data-attr-foo-bar': new Set(['foo-bar']),
      },
      booleanAttributes: new Set(['data-is-foo']),
      properties: new Set(['--prop-foo', '--prop-bar']),
    }

    const result = render('component', data)
    expect(result).toMatchSnapshot()
  })

  it('renders Vue component (minimal)', () => {
    const data: Data = {
      comment: 'comment',
      tag: 'div',
      className: 'foo',
      attributes: {},
      booleanAttributes: new Set(),
      properties: new Set(),
    }

    const result = render('component', data)
    expect(result).toMatchSnapshot()
  })

  it('renders Vue component (void element)', () => {
    const data: Data = {
      comment: 'comment',
      tag: 'hr', // hr is a void element and should not have children
      className: 'foo',
      attributes: {},
      booleanAttributes: new Set(),
      properties: new Set(),
    }

    const result = render('component', data)
    expect(result).toMatchSnapshot()
  })
})

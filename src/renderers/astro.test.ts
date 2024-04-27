import { expect, it, describe } from 'vitest'

import { Data } from '../parser.js'
import { render } from './astro.js'

describe('render', () => {
  it('renders Astro component (full)', () => {
    const data: Data = {
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

  it('renders Astro component (minimal)', () => {
    const data: Data = {
      tag: 'div',
      className: 'foo',
      attributes: {},
      booleanAttributes: new Set(),
      properties: new Set(),
    }

    const result = render('component', data)
    expect(result).toMatchSnapshot()
  })

  it('renders Astro component (void element)', () => {
    const data: Data = {
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
# How to

## Logical operators with CSS

```css
/* props.foo === 'x' && props.bar === 'y' */
&[data-foo='x']&[data-bar='y'] {
  /* ... */
}
```

```css
/* props.foo === 'x' || props.bar === 'y' */
&[data-foo='x'],
&[data-bar='y'] {
  /* ... */
}
```

## Add state

To incorporate state, simply wrap your MistCSS component:

```jsx
import { Button } from './Button.mist'

export function ButtonCount(props) {
  const [count, setCount] = useState(0)
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>
}
```

You can also rename `Button.mist.css` to `_Button.mist.css` to indicate that it shouldn't be used directly.

# Create a component

```css
@scope (div.badge) {
  :scope {
    background: black;
    color: white;
  }
}
```

```jsx
<Badge>hello</Badge>

<Badge onSubmit={}>Error</Badge>
```

# Enum properties

```css
@scope (button.custom-button) {
  :scope {
    font-size: 1rem;

    &[data-size='small'] {
      font-size: 0.5rem;
    }

    &[data-size='large'] {
      font-size: 2rem;
    }
  }
}
```

```jsx
<CustomButton>Save</CustomButton>
<CustomButton size="large">Save</CustomButton>

<CustomButton size="extra-large">Save</CustomButton>
```

# Boolean properties

# String values

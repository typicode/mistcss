// @ts-nocheck
export function App() {
  return (
    <main>
      <button>Default button</button>
      <button data-variant="primary">Primary button</button>
      <button data-variant="secondary">Secondary button</button>

      <div data-component="card" data-size="sm">
        Small card
      </div>
      <div data-component="card" data-size="xl">
        XL card
      </div>
      <div data-component="card-title">Card title</div>
    </main>
  )
}

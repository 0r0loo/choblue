import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Clipboard mock setup
// ---------------------------------------------------------------------------
// Problem: @testing-library/user-event v14+ replaces navigator.clipboard with
// its own Clipboard stub via Object.defineProperty in userEvent.setup().
// This breaks tests that mock navigator.clipboard.writeText with vi.fn()
// because the mock gets overwritten by userEvent's stub.
//
// Solution: Intercept Object.defineProperty on navigator for the 'clipboard'
// property to prevent userEvent from replacing test-provided clipboard mocks.
// Tests can still set clipboard mocks via Object.assign(navigator, { clipboard: ... })
// because the writable data property allows direct assignment.
// ---------------------------------------------------------------------------

// 1. Make clipboard a writable data property on both prototype and instance
const defaultClipboard = {
  writeText: () => Promise.resolve(),
  readText: () => Promise.resolve(''),
};

Object.defineProperty(Object.getPrototypeOf(window.navigator), 'clipboard', {
  value: defaultClipboard,
  writable: true,
  configurable: true,
});

Object.defineProperty(window.navigator, 'clipboard', {
  value: defaultClipboard,
  writable: true,
  configurable: true,
});

// 2. Prevent userEvent from replacing clipboard with its own stub via defineProperty.
//    userEvent calls Object.defineProperty(window.navigator, 'clipboard', { get: ()=>stub })
//    which would replace any test-provided clipboard mock.
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function <T>(
  obj: T,
  prop: PropertyKey,
  descriptor: PropertyDescriptor & ThisType<unknown>,
): T {
  if (obj === navigator && prop === 'clipboard') {
    // Skip: do not let userEvent (or other libraries) replace our clipboard mock
    return obj;
  }
  return originalDefineProperty.call(this, obj, prop, descriptor) as T;
} as typeof Object.defineProperty;

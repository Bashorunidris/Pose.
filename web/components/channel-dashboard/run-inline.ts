/**
 * Runs one of the legacy inline `on*` handler bodies from the ported dashboard
 * markup. `new Function(...).call(element, event)` reproduces classic inline
 * handler semantics exactly: `this` is the element and bare identifiers resolve
 * against `window`, which is where the dashboard runtime publishes its handlers.
 */
export function runInline(event: { currentTarget: EventTarget | null }, source: string): void {
  const element = event.currentTarget as HTMLElement | null;
  try {
    const handler = new Function('event', source) as (this: HTMLElement | null, e: unknown) => void;
    handler.call(element, event);
  } catch (error) {
    console.warn(`[channel-dashboard] inline handler failed: ${source}`, error);
  }
}

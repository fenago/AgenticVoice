/**
 * Simple stub to prevent TypeScript build errors
 */
export function lazyLoad(importFn: () => Promise<any>): any {
  return function(): null { return null; };
}

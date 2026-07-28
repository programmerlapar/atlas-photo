declare module 'lodash.debounce' {
  function debounce<T extends (...args: any[]) => void>(
    fn: T,
    wait?: number,
    options?: { leading?: boolean; maxWait?: number; trailing?: boolean }
  ): T & { cancel: () => void; flush: () => void };
  export default debounce;
}

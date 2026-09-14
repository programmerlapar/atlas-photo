declare module 'lodash.debounce' {
  type DebouncedFunc<T extends (...args: never[]) => void> = T & {
    cancel: () => void;
    flush: () => void;
  };

  function debounce<T extends (...args: never[]) => void>(
    fn: T,
    wait?: number,
    options?: { leading?: boolean; maxWait?: number; trailing?: boolean }
  ): DebouncedFunc<T>;
  export default debounce;
}

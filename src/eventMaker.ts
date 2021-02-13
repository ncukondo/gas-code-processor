type ToArgsType<T> = T extends Array<unknown> ? T : readonly [T];
type EventHandler<T> = (...args: ToArgsType<T>) => unknown;

type Eventemitter<T> = {
  /**
   * Register an event handler
   */
  (handler: EventHandler<T>): void;
  /**
   * Register an once only event handler
   */
  once: (handler: EventHandler<T>) => void;
  /**
   * Remove an event handler
   */
  remove: (handler: EventHandler<T>) => void;
  /**
   * Remove all event handlers
   */
  clear: () => void;
  /**
   * Invoke all handlers
   */
  emit: (...value: ToArgsType<T>) => void;
};

const makeEvent = <
  T extends ReadonlyArray<unknown> | unknown = []
>(): Eventemitter<T> => {
  const map = new Map<EventHandler<T>, EventHandler<T>>();
  return Object.assign(
    (handler: EventHandler<T>) => map.set(handler, handler),
    {
      once(handler: EventHandler<T>) {
        const onceHandler = (...value: ToArgsType<T>) => {
          map.delete(handler);
          handler(...value);
        };
        map.set(handler, onceHandler);
      },
      remove(handler: EventHandler<T>) {
        map.delete(handler);
      },
      clear() {
        map.clear();
      },
      emit(...value: ToArgsType<T>) {
        map.forEach((handler) => handler(...value));
      },
    }
  );
};

export { makeEvent };
// eslint-disable-next-line no-undef
export type { EventHandler, Eventemitter };

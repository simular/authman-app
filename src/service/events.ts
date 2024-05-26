
declare type EventHandler = (...args: any[]) => void;

class EventBus {
  on(
    event: string,
    handler: EventHandler,
    options: AddEventListenerOptions = {}
  ) {
    document.addEventListener(
      event,
      (e: Event) => {
        if (e instanceof CustomEvent) {
          if (Array.isArray(e.detail)) {
            handler(...e.detail);
          } else {
            handler(e.detail);
          }
        }
      },
      options
    );
  }

  once(
    event: string,
    handler: EventHandler,
    options: AddEventListenerOptions = {}
  ) {
    options.once = true;

    this.on(event, handler, options);
  }

  emit(event: string, ...args: any[]) {
    return document.dispatchEvent(
      new CustomEvent(
        event,
        {
          detail: args
        }
      )
    );
  }

  off(event: string, handler: EventListenerOrEventListenerObject, options: EventListenerOptions = {}) {
    document.removeEventListener(event, handler, options);
  }
}

export default new EventBus();

export const LockScreenEvent = 'screen.lock';
export const RootNavigationEvent = 'root.redirect';

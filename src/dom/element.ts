export const o = (options: IElementOptions) => {
  const el = document.createElement(options.el);
  if (options.classes) {
    el.classList.add(...(Array.isArray(options.classes) ? options.classes : [options.classes]));
  }
  if (options.text) {
    el.textContent = options.text;
  }
  if (options.events) {
    for (const [eventName,eventHandler] of Object.entries(options.events)) {
      el.addEventListener(eventName, eventHandler!);
    }
  }

  return el;
};

interface IElementOptions {
  el: keyof HTMLElementTagNameMap;
  classes?: string | string[];
  text?: string;
  events?: Partial<
    Record<
      keyof HTMLElementEventMap,
      <K extends keyof HTMLElementEventMap>(
        this: HTMLObjectElement,
        ev: HTMLElementEventMap[K],
      ) => any
    >
  >;
}

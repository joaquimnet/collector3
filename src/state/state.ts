import produce, { Draft } from 'immer';
import equal from 'fast-deep-equal';
import { diff } from 'deep-diff';

export class State<T> {
  private _state: T;
  actions: Map<string, (draftState: Draft<T>, payload: any) => void>;
  observers: Map<string, Array<(newValue: any) => any>>;

  constructor(initialState: T) {
    this._state = produce((draft) => draft, initialState)() as T;
    this.actions = new Map();
    this.observers = new Map();
  }

  public get state(): T {
    return this._state;
  }

  addAction(actionName: string, changer: (draftState: Draft<T>, payload: any) => void) {
    this.actions.set(actionName, changer);
  }

  removeAction(actionName: string) {
    this.actions.delete(actionName);
  }

  addObserver(pathName: string, eventHandler: (newValue: any) => any) {
    let pathHandlers = this.observers.get(pathName);
    if (!pathHandlers) {
      pathHandlers = [eventHandler];
      this.observers.set(pathName, pathHandlers);
    }
    if (pathHandlers.some((handler) => handler === eventHandler)) {
      return;
    }
    pathHandlers.push(eventHandler);
  }

  removeObserver(pathName: string, eventHandler: (newValue: any) => any) {
    let pathHandlers = this.observers.get(pathName);
    if (!pathHandlers) {
      return;
    }
    if (!pathHandlers.some((handler) => handler === eventHandler)) {
      return;
    }
    pathHandlers.splice(pathHandlers.indexOf(eventHandler), 1);
  }

  dispatch(action: string, payload: any) {
    const changer = this.actions.get(action);
    if (!changer) {
      console.log('!changer: ', !changer);
      return;
    }

    const nextState = produce(this._state, (draftState) => {
      changer(draftState, payload);
    });

    if (!equal(this._state, nextState)) {
      const differences = diff(this._state, nextState);
      if (differences) {
        for (const difference of differences) {
          const path = difference.path?.join('.');
          if (this.observers.has(path!)) {
            for (const handler of this.observers.get(path!)!) {
              handler(path?.split('.').reduce((a: any, b: string) => a[b], nextState));
            }
          }
        }
      }
    }

    this._state = nextState;
  }
}

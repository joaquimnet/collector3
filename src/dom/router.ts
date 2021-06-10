export default class Router implements IRouterProps {
  root: IRouterProps['root'];
  mode: IRouterProps['mode'];
  private routes: IRoute[];
  private current?: string;
  private intervalId?: number;
  private unmount?: Function;

  constructor(options: IRouterOptions) {
    this.routes = [];
    this.root = '/';
    // @ts-ignore
    this.mode = window.history.pushState ? 'history' : 'hash';
    if (options.mode) this.mode = options.mode;
    if (options.root) this.root = options.root;

    // this.current = this.getFragment();
    this.current = undefined;
  }

  add = (path: IRoute['path'], cb: IRoute['cb']) => {
    this.routes.push({ path, cb });
    return this;
  };

  remove = (path: IRoute['path']) => {
    for (let i = 0; i < this.routes.length; i += 1) {
      if (this.routes[i].path === path) {
        this.routes.slice(i, 1);
        break;
      }
    }
    return this;
  };

  flush = () => {
    this.routes = [];
    return this;
  };

  /**
   * Removes leading and trailing slashes.
   */
  private clearSlashes = (path: string) => path.toString().replace(/(^\/|\/$)/g, '');

  /**
   * Gets current path fragment.
   */
  private getFragment = () => {
    let fragment = '';
    if (this.mode === 'history') {
      fragment = this.clearSlashes(decodeURI(window.location.pathname + window.location.search));
      fragment = fragment.replace(/\?(.*)$/, '');
      fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment;
    } else {
      const match = window.location.href.match(/#(.*)$/);
      fragment = match ? match[1] : '';
    }
    return this.clearSlashes(fragment);
  };

  navigate = (path = '') => {
    if (this.mode === 'history') {
      window.history.pushState(null, null as any, this.root + this.clearSlashes(path));
    } else {
      window.location.href = `${window.location.href.replace(/#(.*)$/, '')}#${path}`;
    }
    // console.log(this.routes);
    return this;
  };

  listen = () => {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.interval, 50);

    if (this.mode === 'history') {
      this.navigate(window.location.pathname);
    } else {
      this.navigate(window.location.href.match(/#(.*)$/)?.[0] ?? this.root);
    }
  };

  private interval = () => {
    if (this.current === this.getFragment()) return;
    this.current = this.getFragment();

    this.routes.some((route) => {
      const match = route.path.match(this.current!);
      if (match) {
        this.unmount?.();
        match.shift();
        const cbReturn = route.cb.apply({}, match);
        if (typeof cbReturn === 'function') {
          this.unmount = cbReturn;
        } else {
          this.unmount = () => {};
        }
        return match;
      }
      return false;
    });
  };
}

interface IRoute {
  /**
   * Path to match in the url.
   */
  path: string;
  /**
   * Function to be called when the path matches.
   */
  cb: Function;
}

interface IRouterProps {
  /**
   * Router mode.
   * History for when pushState is available and hash when it's not.
   */
  mode: 'history' | 'hash';
  /**
   * This router's root path.
   */
  root: string;
}

type IRouterOptions = Omit<IRouterProps, 'routes'>;

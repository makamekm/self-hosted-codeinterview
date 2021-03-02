export function makeSimpleHotPromise<T = void>() {
  let _resolved = false;
  let resolved = () => {
    return _resolved;
  };
  let resolve: (a: T) => void = () => undefined;
  let reject: (msg?: string) => void = () => undefined;
  let promise = new Promise<T>((r, e) => {
    resolve = (...args) => {
      _resolved = true;
      r(...args);
    };
    reject = e;
  });
  return {
    resolved,
    resolve,
    reject,
    promise,
  };
}

export function makeHotPromise<T = void>() {
  let hotPromise = makeSimpleHotPromise<T>();
  let obj = {
    ...hotPromise,
    reinit: () => {
      Object.assign(obj, makeSimpleHotPromise());
    },
  };

  return obj;
}

import React from "react";
import { reaction, toJS } from "mobx";
import { debounce } from "ts-debounce";
import { deepObserve } from "mobx-utils";
import { getDiff } from "./diff.util";

export const useOnChangeDiff: <T, K extends keyof T>(
  state: T,
  name: K,
  fn: (diff) => any,
  delay?: number
) => void = (state, name, fn, delay = 100) => {
  React.useEffect(() => {
    let prevValue = toJS(state[name]);

    const ffn = () => {
      const value = state[name];
      const newValue = toJS(value);
      const diffs = getDiff(prevValue, newValue);
      if (diffs.length > 0) {
        prevValue = newValue;
        fn(diffs);
      }
    };

    const fffn = delay ? debounce(ffn, delay) : ffn;

    // fffn();

    let dispose1 = deepObserve(state[name], fffn);

    let dispose2 = reaction(
      () => [state[name]],
      () => {
        dispose1();
        dispose1 = deepObserve(state[name], fffn);
      }
    );

    return () => {
      dispose1();
      dispose2();
    };
  }, [state, name, fn, delay]);
};

/*

  creates and returns a debounced function which you can use to call

*/

export default ({ fn, delay, context, immediate }) => {
  let timer;

  return (...args) => {
    if (immediate && !timer) {
      fn.apply(context, args);
    } else {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(context, args);
      }

      timer = undefined;
    }, delay);
  };
};

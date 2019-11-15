export function logToConsole(level, module, message, ...args) {
  const fn =
    {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.log,
      verbose: console.log
    }[level] || console.debug;

  const colors = {
    error: `#c0392b`, // Red
    warn: `#f39c12`, // Yellow
    info: `blue`, // Blue
    debug: `#7f8c8d`, // Gray
    verbose: `#2ecc71` // Green
  };

  // from Workbox
  const styles = [
    `background: ${colors[level]}`,
    `border-radius: 0.5em`,
    `color: white`,
    `font-weight: bold`,
    `padding: 2px 0.5em`
  ];

  fn(`%c${module}%c ${message}`, styles.join(";"), "", ...args);
}

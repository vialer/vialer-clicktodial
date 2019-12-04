/**
 * Clean a string for use as a phone number.
 *
 * Removes spaces, dashes and parentheses from a string. If the remainder of the
 * string looks like a phone number (optionally starts with a plus, the rest
 * numbers), it is returned. Otherwise `undefined` is returned.
 */
export default function cleanPhoneNumber(str) {
  const number = str.replace(/[\s-().]|[^\x00-\x7F]/g, '');
  if (number.match(/^\+?\d+$/)) {
    return number;
  } else {
    return undefined;
  }
}

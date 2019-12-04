import replaceSpecialCharacters from '/utils/replaceSpecialCharacters.mjs';

const searchTheseProperties = ['description', 'phoneNumber'];

export function processSearchProperties(data) {
  return searchTheseProperties.reduce((prev, property) => {
    if (property in data) {
      prev.push(`${data[property]}`.toLowerCase());
      prev.push(replaceSpecialCharacters(data[property]).toLowerCase());
    }
    return prev;
  }, []);
}

const replacers = [
    [/á|à|ä|â/gi, 'a'],
    [/é|è|ë|ê/gi, 'e'],
    [/í|ì|ï|î/gi, 'i'],
    [/ó|ò|ö|ô/gi, 'o'],
    [/ú|ù|ü|û/gi, 'u']
  ];
  
  export default function replaceSpecialCharacters (str) {
    return replacers.reduce((prev, [regexp, replaceWith]) => {
      return prev.replace(regexp, replaceWith);
    }, `${str}`);
  }
  
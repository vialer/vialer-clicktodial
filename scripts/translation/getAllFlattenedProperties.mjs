export default function getAllFlattenedProperties(ob, name = '', target = {}) {
  Object.keys(ob).sort().forEach(key => {
    const extendedKey = `${name ? `${name}.` : ''}${key}`;

    if ('string' === typeof ob[key]) {
      target[extendedKey] = undefined;
    } else if ('object' === typeof ob[key]) {
      target[extendedKey] = getAllFlattenedProperties(ob[key], extendedKey, target);
    }
  });

  return target;
}


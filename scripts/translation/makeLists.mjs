export default function makeLists(ob) {
  const returnObject = Object.create(null);

  Object.keys(ob)
    .sort()
    .forEach(key => {
      returnObject[key] = Object.keys(ob[key]).sort();
    });

  return returnObject;
}

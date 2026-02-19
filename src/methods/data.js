export function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeJson(destinationData, addedData, depthBreadcrumb = []) {
  for (const addedKey in addedData) {
    if (addedKey in destinationData) {
      const destinationEntry = destinationData[addedKey];
      const addedEntry = addedData[addedKey];

      if (isObject(destinationEntry) && isObject(addedEntry)) {
        mergeJson(
          destinationEntry,
          addedEntry,
          depthBreadcrumb.concat([addedKey])
        );
      } else {
        throw new Error(
          `Unable to merge JSON objects; a shared key has conflicting values. Breadcrumb: ${depthBreadcrumb}`
        );
      }
    } else {
      destinationData[addedKey] = addedData[addedKey];
    }
  }
}

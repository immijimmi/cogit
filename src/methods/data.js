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
          `Unable to merge JSON objects; a shared key has conflicting values. Breadcrumb: ${depthBreadcrumb.concat(
            [addedKey]
          )}`
        );
      }
    } else {
      destinationData[addedKey] = addedData[addedKey];
    }
  }
}

export function compileJsonFiles(folder_context) {
  const result = {};

  // folder_context must be a require.context object containing only entries for JSON files,
  // as would be returned from (for example) `require.context(<folder path>, true, /\.json$/)`
  const filesDataList = folder_context
    .keys()
    .map((fileKey) => folder_context(fileKey));

  for (const jsonData of filesDataList) {
    mergeJson(result, jsonData);
  }

  return result;
}
